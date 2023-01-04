import type {client, proxy, utils} from '@constl/ipa';
import type {BrowserWindow} from 'electron';
import {ipcMain, app} from 'electron';
import {join} from 'path';
import {v4 as uuidv4} from 'uuid';
import {Lock} from 'semaphore-async-await';
import {EventEmitter, once} from 'stream';
import {
  messageDeServeur,
  messagePourServeur,
  messagePrêtDeServeur,
  CODE_MESSAGE_DE_CLIENT, 
  CODE_MESSAGE_DE_SERVEUR, 
  CODE_MESSAGE_POUR_CLIENT, 
  CODE_MESSAGE_POUR_SERVEUR,
  CODE_CLIENT_PRÊT, 
} from '@/messages.js';

const CODE_PRÊT = "prêt"

export class GestionnaireFenêtres {
  enDéveloppement: boolean;
  importationIPA: Promise<typeof import("@constl/ipa")>;
  importationServeur?: Promise<typeof import("@constl/serveur")>;

  fenêtres: {[key: string]: BrowserWindow};
  clientConstellation: proxy.gestionnaireClient.default | undefined;
  verrouServeur: Lock;
  événements: EventEmitter;
  oublierServeur?: utils.schémaFonctionOublier;
  port?: number;

  constructor({ 
    enDéveloppement,
    importationIPA,
    importationServeur,
  }: { 
    enDéveloppement: boolean;
    importationIPA: Promise<typeof import("@constl/ipa")>;
    importationServeur?: Promise<typeof import("@constl/serveur")>;
  }) {
    this.enDéveloppement = enDéveloppement;
    this.importationIPA = importationIPA;
    this.importationServeur = importationServeur

    this.fenêtres = {};
    this.verrouServeur = new Lock();
    this.événements = new EventEmitter();
    this.initialiser();
  }

  async initialiser() {
    const {gestionnaireClient} = (await this.importationIPA).proxy;
    const opts: client.optsConstellation = {
      orbite: {
        sfip: {
          dossier: join(app.getPath('userData'), this.enDéveloppement ? join('dév', 'sfip') : 'sfip'),
        },
        dossier: join(app.getPath('userData'), this.enDéveloppement ? join('dév', 'orbite') : 'orbite'),
      },
    };
    this.clientConstellation = new gestionnaireClient.default(
      (m: proxy.messages.MessageDeTravailleur) => this.envoyerMessageDuClient(m),
      (e: string) => this.envoyerErreur(e),
      opts,
    );
    ipcMain.on(
        CODE_MESSAGE_POUR_SERVEUR, 
        async (_event, message: messagePourServeur) => {
        switch (message.type) {
            case 'init': {
                const port = await this.initialiserServeur(message.port);
                const messagePrêt: messagePrêtDeServeur = {
                    type: 'prêt',
                    port,
                };
                this.envoyerMessageDuServeur(messagePrêt);
                break;
            }
                case 'fermer':
                this.fermerServeur();
                break;
                default:
                throw new Error('Message inconnu : ' + JSON.stringify(message));
            }
        }
    );
    this.événements.emit(CODE_PRÊT);
  }

  async prêt() {
    if (!this.clientConstellation) await once(this.événements, CODE_PRÊT);
  }

  private connecterFenêtre(fenêtre: BrowserWindow, id: string): string {
    this.fenêtres[id] = fenêtre;
    return id;
  }

  private déconnecterFenêtre(idFenêtre: string): void {
    delete this.fenêtres[idFenêtre];
  }

  envoyerMessageDuServeur(m: messageDeServeur) {
    Object.values(this.fenêtres).forEach(f => f.webContents.send(CODE_MESSAGE_DE_SERVEUR, m));
  }

  envoyerMessageDuClient(m: proxy.messages.MessageDeTravailleur) {
    if (m.id) {
      const idFenêtre = m.id.split(':')[0];
      m.id = m.id.split(':').slice(1).join(':');

      const fenêtre = this.fenêtres[idFenêtre];
      fenêtre.webContents.send(CODE_MESSAGE_DE_CLIENT, m);
    } else {
      Object.values(this.fenêtres).forEach(f => f.webContents.send(CODE_MESSAGE_DE_CLIENT, m));
    }
  }

  envoyerMessage(m: proxy.messages.MessageDeTravailleur) {
    if (m.id) {
      const idFenêtre = m.id.split(':')[0];
      m.id = m.id.split(':').slice(1).join(':');
      const fenêtre = this.fenêtres[idFenêtre];
      fenêtre.webContents.send(CODE_MESSAGE_DE_CLIENT, m);
    } else {
      Object.values(this.fenêtres).forEach(f => f.webContents.send(
        CODE_MESSAGE_DE_CLIENT, 
        m
      ));
    }
  }

  envoyerErreur(e: string) {
    const messageErreur: proxy.messages.MessageErreurDeTravailleur = {
      type: 'erreur',
      erreur: e,
    };
    Object.values(this.fenêtres).forEach(
      f => f.webContents.send(CODE_MESSAGE_DE_CLIENT, messageErreur)
      );
  }
  connecterFenêtreÀConstellation(fenêtre: BrowserWindow) {
    const id = uuidv4();
    this.connecterFenêtre(fenêtre, id);

    const fSuivreMessagesPourConstellation = async (
      _event: Event,
      message: proxy.messages.MessagePourTravailleur,
    ): Promise<void> => {
      await this.prêt();

      if (!this.clientConstellation) throw new Error("Constellation n'est pas initialisée.");

      if (message.id) message.id = id + ':' + message.id;
      await this.clientConstellation.gérerMessage(message);
    };

    ipcMain.on(CODE_MESSAGE_POUR_CLIENT, fSuivreMessagesPourConstellation);

    // Sigaler que la fenêtre est bien attachée
    fenêtre.webContents.send(CODE_CLIENT_PRÊT);

    const déconnecter = () => {
      ipcMain.off(CODE_MESSAGE_POUR_CLIENT, fSuivreMessagesPourConstellation);
      this.déconnecterFenêtre(id);
    };
    fenêtre.on('close', déconnecter);
  }

  async initialiserServeur(port?: number): Promise<number> {
    if (!this.clientConstellation) await this.prêt();
    if (!this.importationServeur) throw new Error("Le GestionnaireFenêtres n'a pas été initialisé avec le module @constl/serveur.")

    await this.verrouServeur.acquire();

    // Fermer le serveur si on chage de port
    if (port !== undefined && this.port !== undefined && port !== this.port) {
      if (this.oublierServeur) await this.oublierServeur();
      this.port = undefined;
    }

    if (!this.port) {
      if (!this.clientConstellation) throw new Error("Erreur d'initialisation de Constellation");

      const constlServeur = await this.importationServeur;
      const {fermerServeur, port: portServeur} = await constlServeur.lancerServeur({
        port,
        optsConstellation: this.clientConstellation,
      });

      this.oublierServeur = fermerServeur;
      this.port = portServeur;
    }

    this.verrouServeur.release();
    
    if (!this.port) throw new Error("Erreur d'initialisation du serveur local Constellation");
    return this.port;
  }

  async fermerConstellation() {
    await this.fermerServeur();
    if (this.clientConstellation) await this.clientConstellation.fermer();
    this.clientConstellation = undefined;
  }

  async fermerServeur() {
    await this.verrouServeur.acquire();
    if (this.oublierServeur) await this.oublierServeur();
    this.port = undefined;
    this.verrouServeur.release();
  }
}

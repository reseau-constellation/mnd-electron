import type { client, mandataire } from "@constl/ipa";
import type {
  ErreurMandataire,
  MessageDIpa,
  MessageErreurDIpa,
  MessagePourIpa,
} from "@constl/mandataire";
import TypedEmitter from "typed-emitter";

import type { BrowserWindow, IpcMainEvent } from "electron";
import { app, ipcMain } from "electron";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { Lock } from "semaphore-async-await";
import { EventEmitter, once } from "stream";
import {
  messageDeServeur,
  messagePourServeur,
  messagePrêtDeServeur,
  CODE_MESSAGE_D_IPA,
  CODE_MESSAGE_DE_SERVEUR,
  CODE_MESSAGE_POUR_IPA,
  CODE_MESSAGE_POUR_SERVEUR,
  CODE_CLIENT_PRÊT,
  messageAuthServeur,
  messageRequêtesConnexion,
} from "@/messages.js";

const CODE_PRÊT = "prêt";

type ÉvénementsGestionnaire = {
  [CODE_PRÊT]: () => void;
};

export class GestionnaireFenêtres {
  enDéveloppement: boolean;
  importationIPA: Promise<typeof import("@constl/ipa")>;
  importationServeur?: Promise<typeof import("@constl/serveur")>;
  journal?: (msg: string) => void;
  opts?: client.optsConstellation;

  fenêtres: { [key: string]: BrowserWindow };
  constellation: mandataire.EnveloppeIpa | undefined;
  verrouServeur: Lock;
  événements: TypedEmitter<ÉvénementsGestionnaire>;
  connexionServeur?: Awaited<
    ReturnType<
      Exclude<
        Awaited<GestionnaireFenêtres["importationServeur"]>,
        undefined
      >["lancerServeur"]
    >
  >;
  requêtesServeur: { [idSuivi: string]: () => void };

  constructor({
    enDéveloppement,
    importationIPA,
    importationServeur,
    journal,
    opts,
  }: {
    enDéveloppement: boolean;
    importationIPA: Promise<typeof import("@constl/ipa")>;
    importationServeur?: Promise<typeof import("@constl/serveur")>;
    journal?: (msg: string) => void;
    opts?: client.optsConstellation;
  }) {
    this.enDéveloppement = enDéveloppement;
    this.importationIPA = importationIPA;
    this.importationServeur = importationServeur;
    this.journal = journal;
    this.opts = opts;

    this.fenêtres = {};
    this.requêtesServeur = {};
    this.verrouServeur = new Lock();
    this.événements =
      new EventEmitter() as TypedEmitter<ÉvénementsGestionnaire>;
    this.initialiser();
  }

  async initialiser() {
    const { EnveloppeIpa } = (await this.importationIPA).mandataire;
    const opts: client.optsConstellation = {
      dossier: join(
        app.getPath("userData"),
        this.enDéveloppement ? "constl-dév" : "constl",
      ),
      ...this.opts,
    };
    this.constellation = new EnveloppeIpa(
      (m: MessageDIpa) => this.envoyerMessageDIpa(m),
      (e: ErreurMandataire) => this.envoyerErreur(e),
      opts,
    );
    ipcMain.on(
      CODE_MESSAGE_POUR_SERVEUR,
      async (_event, message: messagePourServeur) => {
        if (this.journal)
          this.journal(
            `${CODE_MESSAGE_POUR_SERVEUR} : ${JSON.stringify(message)}`,
          );
        switch (message.type) {
          case "init": {
            const { port, codeSecret } = await this.initialiserServeur(
              message.port,
            );
            const messagePrêt: messagePrêtDeServeur = {
              type: "prêt",
              port,
              codeSecret,
            };
            this.envoyerMessageDuServeur(messagePrêt);
            break;
          }

          case "auth":
            this.gérerMessageAuthServeur(message);
            break;

          case "fermer":
            this.fermerServeur();
            break;

          default:
            throw new Error("Message inconnu : " + JSON.stringify(message));
        }
      },
    );
    this.événements.emit(CODE_PRÊT);
  }

  async prêt() {
    if (!this.constellation) await once(this.événements, CODE_PRÊT);
  }

  private connecterFenêtre(fenêtre: BrowserWindow, id: string): string {
    this.fenêtres[id] = fenêtre;
    return id;
  }

  private déconnecterFenêtre(idFenêtre: string): void {
    delete this.fenêtres[idFenêtre];
  }

  envoyerMessageDuServeur(m: messageDeServeur) {
    Object.values(this.fenêtres).forEach((f) =>
      f.webContents.send(CODE_MESSAGE_DE_SERVEUR, m),
    );
  }

  envoyerMessageDIpa(m: MessageDIpa) {
    if (m.idRequête) {
      const idFenêtre = m.idRequête.split(":")[0];
      m.idRequête = m.idRequête.split(":").slice(1).join(":");

      const fenêtre = this.fenêtres[idFenêtre];
      fenêtre.webContents.send(CODE_MESSAGE_D_IPA, m);
    } else {
      Object.values(this.fenêtres).forEach((f) =>
        f.webContents.send(CODE_MESSAGE_D_IPA, m),
      );
    }
  }

  envoyerErreur({
    erreur,
    idRequête,
    code,
  }: {
    erreur: string;
    idRequête?: string;
    code: string;
  }) {
    const messageErreur: MessageErreurDIpa = {
      type: "erreur",
      erreur,
      idRequête,
      codeErreur: code,
    };
    Object.values(this.fenêtres).forEach((f) =>
      f.webContents.send(CODE_MESSAGE_D_IPA, messageErreur),
    );
  }

  connecterFenêtreÀConstellation(fenêtre: BrowserWindow) {
    const id = uuidv4();
    this.connecterFenêtre(fenêtre, id);

    const fSuivreMessagesPourConstellation = async (
      _event: IpcMainEvent,
      message: MessagePourIpa,
    ): Promise<void> => {
      await this.prêt();

      if (!this.constellation)
        throw new Error("Constellation n'est pas initialisée.");

      if (message.idRequête) message.idRequête = id + ":" + message.idRequête;
      await this.constellation.gérerMessage(message);
    };

    ipcMain.on(CODE_MESSAGE_POUR_IPA, fSuivreMessagesPourConstellation);

    // Sigaler que la fenêtre est bien attachée
    fenêtre.webContents.send(CODE_CLIENT_PRÊT);

    const déconnecter = () => {
      ipcMain.off(CODE_MESSAGE_POUR_IPA, fSuivreMessagesPourConstellation);
      this.déconnecterFenêtre(id);
    };
    fenêtre.on("close", déconnecter);
  }

  async initialiserServeur(
    port?: number,
  ): Promise<{ port: number; codeSecret: string }> {
    await this.prêt();
    if (!this.importationServeur)
      throw new Error(
        "Le GestionnaireFenêtres n'a pas été initialisé avec le module @constl/serveur.",
      );

    await this.verrouServeur.acquire();

    // Fermer le serveur si on chage de port
    if (
      port !== undefined &&
      this.connexionServeur?.port !== undefined &&
      port !== this.connexionServeur.port
    ) {
      await this.fermerServeur();
    }

    if (!this.connexionServeur) {
      if (!this.constellation)
        throw new Error("Erreur d'initialisation de Constellation");

      const constlServeur = await this.importationServeur;
      this.connexionServeur = await constlServeur.lancerServeur({
        port,
        optsConstellation: this.constellation,
      });
    }

    this.verrouServeur.release();

    if (!this.connexionServeur)
      throw new Error("Erreur d'initialisation du serveur local Constellation");
    return this.connexionServeur;
  }

  async gérerMessageAuthServeur(message: messageAuthServeur) {
    switch (message.contenu.type) {
      case "approuverRequête":
        this.connexionServeur?.approuverRequête(message.contenu.idRequête);
        break;

      case "refuserRequête":
        this.connexionServeur?.refuserRequête(message.contenu.idRequête);
        break;

      case "suivreRequêtes": {
        const fOublierSuivi = this.connexionServeur?.suivreRequêtes(
          (requêtes) => {
            const messageRetour: messageRequêtesConnexion = {
              type: "requêtesConnexion",
              requêtes,
            };
            this.envoyerMessageDuServeur(messageRetour);
          },
        );
        if (fOublierSuivi)
          this.requêtesServeur[message.contenu.idSuivi] = fOublierSuivi;
        break;
      }
      case "oublierRequêtes":
        this.requêtesServeur[message.contenu.idSuivi]?.();
        delete this.requêtesServeur[message.contenu.idSuivi];
        break;

      default:
        break;
    }
  }

  async fermerConstellation() {
    await this.fermerServeur();
    if (this.constellation) await this.constellation.fermer();
    this.constellation = undefined;
  }

  async fermerServeur() {
    await this.verrouServeur.acquire();
    await this.connexionServeur?.fermerServeur?.();
    this.connexionServeur = undefined;
    this.verrouServeur.release();
  }
}

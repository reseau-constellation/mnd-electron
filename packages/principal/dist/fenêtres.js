import { ipcMain, app } from 'electron';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Lock } from 'semaphore-async-await';
import { EventEmitter, once } from 'stream';
import { CODE_MESSAGE_DE_CLIENT, CODE_MESSAGE_DE_SERVEUR, CODE_MESSAGE_POUR_CLIENT, CODE_MESSAGE_POUR_SERVEUR, CODE_CLIENT_PRÊT, } from "./messages.js";
const promesseIPA = import('@constl/ipa');
const promesseServeur = import('@constl/serveur');
const CODE_PRÊT = "prêt";
export class GestionnaireFenêtres {
    enDéveloppement;
    fenêtres;
    clientConstellation;
    verrouServeur;
    événements;
    oublierServeur;
    port;
    constructor({ enDéveloppement }) {
        this.enDéveloppement = enDéveloppement;
        this.fenêtres = {};
        this.verrouServeur = new Lock();
        this.événements = new EventEmitter();
        this.initialiser();
    }
    async initialiser() {
        const { gestionnaireClient } = (await promesseIPA).proxy;
        const opts = {
            orbite: {
                sfip: {
                    dossier: join(app.getPath('userData'), this.enDéveloppement ? join('dév', 'sfip') : 'sfip'),
                },
                dossier: join(app.getPath('userData'), this.enDéveloppement ? join('dév', 'orbite') : 'orbite'),
            },
        };
        this.clientConstellation = new gestionnaireClient.default((m) => this.envoyerMessageDuClient(m), (e) => this.envoyerErreur(e), opts);
        ipcMain.on(CODE_MESSAGE_POUR_SERVEUR, async (_event, message) => {
            switch (message.type) {
                case 'init': {
                    const port = await this.initialiserServeur(message.port);
                    const messagePrêt = {
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
        });
        this.événements.emit(CODE_PRÊT);
    }
    async prêt() {
        if (!this.clientConstellation)
            await once(this.événements, CODE_PRÊT);
    }
    connecterFenêtre(fenêtre, id) {
        this.fenêtres[id] = fenêtre;
        return id;
    }
    déconnecterFenêtre(idFenêtre) {
        delete this.fenêtres[idFenêtre];
    }
    envoyerMessageDuServeur(m) {
        Object.values(this.fenêtres).forEach(f => f.webContents.send(CODE_MESSAGE_DE_SERVEUR, m));
    }
    envoyerMessageDuClient(m) {
        if (m.id) {
            const idFenêtre = m.id.split(':')[0];
            m.id = m.id.split(':').slice(1).join(':');
            const fenêtre = this.fenêtres[idFenêtre];
            fenêtre.webContents.send(CODE_MESSAGE_DE_CLIENT, m);
        }
        else {
            Object.values(this.fenêtres).forEach(f => f.webContents.send(CODE_MESSAGE_DE_CLIENT, m));
        }
    }
    envoyerMessage(m) {
        if (m.id) {
            const idFenêtre = m.id.split(':')[0];
            m.id = m.id.split(':').slice(1).join(':');
            const fenêtre = this.fenêtres[idFenêtre];
            fenêtre.webContents.send(CODE_MESSAGE_DE_CLIENT, m);
        }
        else {
            Object.values(this.fenêtres).forEach(f => f.webContents.send(CODE_MESSAGE_DE_CLIENT, m));
        }
    }
    envoyerErreur(e) {
        const messageErreur = {
            type: 'erreur',
            erreur: e,
        };
        Object.values(this.fenêtres).forEach(f => f.webContents.send(CODE_MESSAGE_DE_CLIENT, messageErreur));
    }
    connecterFenêtreÀConstellation(fenêtre) {
        const id = uuidv4();
        this.connecterFenêtre(fenêtre, id);
        const fSuivreMessagesPourConstellation = async (_event, message) => {
            await this.prêt();
            if (!this.clientConstellation)
                throw new Error("Constellation n'est pas initialisée.");
            if (message.id)
                message.id = id + ':' + message.id;
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
    async initialiserServeur(port) {
        if (!this.clientConstellation)
            await this.prêt();
        await this.verrouServeur.acquire();
        // Fermer le serveur si on chage de port
        if (port !== undefined && this.port !== undefined && port !== this.port) {
            if (this.oublierServeur)
                await this.oublierServeur();
            this.port = undefined;
        }
        if (!this.port) {
            if (!this.clientConstellation)
                throw new Error("Erreur d'initialisation de Constellation");
            const constlServeur = await promesseServeur;
            const { fermerServeur, port: portServeur } = await constlServeur.lancerServeur({
                port,
                optsConstellation: this.clientConstellation,
            });
            this.oublierServeur = fermerServeur;
            this.port = portServeur;
        }
        this.verrouServeur.release();
        if (!this.port)
            throw new Error("Erreur d'initialisation du serveur local Constellation");
        return this.port;
    }
    async fermerConstellation() {
        await this.fermerServeur();
        if (this.clientConstellation)
            await this.clientConstellation.fermer();
        this.clientConstellation = undefined;
    }
    async fermerServeur() {
        await this.verrouServeur.acquire();
        if (this.oublierServeur)
            await this.oublierServeur();
        this.port = undefined;
        this.verrouServeur.release();
    }
}
//# sourceMappingURL=fen%C3%AAtres.js.map
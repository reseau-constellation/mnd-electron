/// <reference types="node" />
import type { proxy, utils } from '@constl/ipa';
import type { BrowserWindow } from 'electron';
import { Lock } from 'semaphore-async-await';
import { EventEmitter } from 'stream';
import { messageDeServeur } from "./messages.js";
export declare class GestionnaireFenêtres {
    enDéveloppement: boolean;
    fenêtres: {
        [key: string]: BrowserWindow;
    };
    clientConstellation: proxy.gestionnaireClient.default | undefined;
    verrouServeur: Lock;
    événements: EventEmitter;
    oublierServeur?: utils.schémaFonctionOublier;
    port?: number;
    constructor({ enDéveloppement }: {
        enDéveloppement: boolean;
    });
    initialiser(): Promise<void>;
    prêt(): Promise<void>;
    private connecterFenêtre;
    private déconnecterFenêtre;
    envoyerMessageDuServeur(m: messageDeServeur): void;
    envoyerMessageDuClient(m: proxy.messages.MessageDeTravailleur): void;
    envoyerMessage(m: proxy.messages.MessageDeTravailleur): void;
    envoyerErreur(e: string): void;
    connecterFenêtreÀConstellation(fenêtre: BrowserWindow): void;
    initialiserServeur(port?: number): Promise<number>;
    fermerConstellation(): Promise<void>;
    fermerServeur(): Promise<void>;
}

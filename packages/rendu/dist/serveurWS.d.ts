/// <reference types="node" />
import { EventEmitter } from 'events';
import type { préchargeur } from "@constl/mandataire-electron-principal";
export declare class GestionnaireServeur {
    messageÀServeurConstellation: préchargeur.messageÀServeurConstellation;
    événements: EventEmitter;
    constructor({ écouterMessagesDeServeurConstellation, messageÀServeurConstellation }: {
        écouterMessagesDeServeurConstellation: préchargeur.écouterMessagesDeServeurConstellation;
        messageÀServeurConstellation: préchargeur.messageÀServeurConstellation;
    });
    initialiser(port?: number): Promise<number>;
    fermer(): Promise<void>;
}

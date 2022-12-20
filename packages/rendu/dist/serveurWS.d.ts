/// <reference types="node" />
import { EventEmitter } from 'events';
import type { messageÀServeurConstellation, écouterMessagesDeServeurConstellation } from "@constl/mandataire-electron-principal";
export declare class GestionnaireServeur {
    messageÀServeurConstellation: typeof messageÀServeurConstellation;
    événements: EventEmitter;
    constructor({ fÉcouterMessagesDeServeurConstellation, fMessageÀServeurConstellation }: {
        fÉcouterMessagesDeServeurConstellation: typeof écouterMessagesDeServeurConstellation;
        fMessageÀServeurConstellation: typeof messageÀServeurConstellation;
    });
    initialiser(port?: number): Promise<number>;
    fermer(): Promise<void>;
}

import type { proxy } from '@constl/ipa';
import type { préchargeur } from "@constl/mandataire-electron-principal";
import { ClientMandatairifiable } from "@constl/mandataire";
export declare class MandataireClientÉlectronPrincipal extends ClientMandatairifiable {
    messageÀConstellation: préchargeur.essageÀConstellation;
    constructor({ écouterMessagesDeConstellation, messageÀConstellation }: {
        écouterMessagesDeConstellation: préchargeur.écouterMessagesDeConstellation;
        messageÀConstellation: préchargeur.messageÀConstellation;
    });
    envoyerMessage(message: proxy.messages.MessagePourTravailleur): void;
}
export declare const générerMandataireÉlectronPrincipal: ({ écouterMessagesDeConstellation, messageÀConstellation }: {
    écouterMessagesDeConstellation: préchargeur.écouterMessagesDeConstellation;
    messageÀConstellation: préchargeur.messageÀConstellation;
}) => import("@constl/mandataire").MandataireClientConstellation;

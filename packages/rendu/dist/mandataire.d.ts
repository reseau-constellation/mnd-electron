import type { proxy } from '@constl/ipa';
import type { messageÀConstellation, écouterMessagesDeConstellation } from "@constl/mandataire-electron-principal";
import { ClientMandatairifiable } from "@constl/mandataire";
export declare class MandataireClientÉlectronPrincipal extends ClientMandatairifiable {
    messageÀConstellation: typeof messageÀConstellation;
    constructor({ fÉcouterMessagesDeConstellation, fMessageÀConstellation }: {
        fÉcouterMessagesDeConstellation: typeof écouterMessagesDeConstellation;
        fMessageÀConstellation: typeof messageÀConstellation;
    });
    envoyerMessage(message: proxy.messages.MessagePourTravailleur): void;
}
export declare const générerMandataireÉlectronPrincipal: ({ fÉcouterMessagesDeConstellation, fMessageÀConstellation }: {
    fÉcouterMessagesDeConstellation: typeof écouterMessagesDeConstellation;
    fMessageÀConstellation: typeof messageÀConstellation;
}) => import("@constl/mandataire").MandataireClientConstellation;

import type { proxy } from '@constl/ipa';
import { messageDeServeur, messagePourServeur } from "./messages.js";
export declare const attendreFenêtreAttachée: () => Promise<void>;
export declare const messageÀConstellation: (message: proxy.messages.MessagePourTravailleur) => Promise<void>;
export declare const écouterMessagesDeConstellation: (f: (message: proxy.messages.MessageDeTravailleur) => void) => (() => void);
export declare const messageÀServeurConstellation: (message: messagePourServeur) => void;
export declare const écouterMessagesDeServeurConstellation: (f: (message: messageDeServeur) => void) => (() => void);

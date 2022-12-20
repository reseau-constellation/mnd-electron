import { ipcRenderer, IpcRendererEvent } from "electron";

import type { proxy } from '@constl/ipa';
import { 
    CODE_CLIENT_PRÊT,
    CODE_MESSAGE_DE_CLIENT,
    CODE_MESSAGE_DE_SERVEUR,
    CODE_MESSAGE_POUR_CLIENT, 
    CODE_MESSAGE_POUR_SERVEUR, 
    messageDeServeur, 
    messagePourServeur 
} from "@/messages.js";

export const attendreFenêtreAttachée = (): Promise<void> => {
    return new Promise<void>(résoudre => {
        ipcRenderer.once(CODE_CLIENT_PRÊT, () => résoudre());
    });
};
  
export const messageÀConstellation = async (message: proxy.messages.MessagePourTravailleur) => {
    // Nécessaire parce que la fenêtre Électron peut être initialisée avant d'être connectée à Constellation
    await attendreFenêtreAttachée();
    ipcRenderer.send(CODE_MESSAGE_POUR_CLIENT, message);
};

export const écouterMessagesDeConstellation = (
f: (message: proxy.messages.MessageDeTravailleur) => void,
): (() => void) => {
    const écouteur = (_event: IpcRendererEvent, ...args: [proxy.messages.MessageDeTravailleur]) => {
        f(...args);
    };
    ipcRenderer.on(CODE_MESSAGE_DE_CLIENT, écouteur);
    return () => ipcRenderer.off(CODE_MESSAGE_DE_CLIENT, écouteur);
};

export const messageÀServeurConstellation = (message: messagePourServeur) => {
    ipcRenderer.send(CODE_MESSAGE_POUR_SERVEUR, message);
};

export const écouterMessagesDeServeurConstellation = (
    f: (message: messageDeServeur) => void,
): (() => void) => {
    const écouteur = (_event: IpcRendererEvent, ...args: [messageDeServeur]) => {
        f(...args);
    };
    ipcRenderer.on(CODE_MESSAGE_DE_SERVEUR, écouteur);
    return () => ipcRenderer.off(CODE_MESSAGE_DE_SERVEUR, écouteur);
};
  
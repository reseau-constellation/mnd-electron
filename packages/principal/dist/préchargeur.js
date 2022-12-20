import { ipcRenderer } from "electron";
import { CODE_CLIENT_PRÊT, CODE_MESSAGE_DE_CLIENT, CODE_MESSAGE_DE_SERVEUR, CODE_MESSAGE_POUR_CLIENT, CODE_MESSAGE_POUR_SERVEUR } from "./messages.js";
export const attendreFenêtreAttachée = () => {
    return new Promise(résoudre => {
        ipcRenderer.once(CODE_CLIENT_PRÊT, () => résoudre());
    });
};
export const messageÀConstellation = async (message) => {
    // Nécessaire parce que la fenêtre Électron peut être initialisée avant d'être connectée à Constellation
    await attendreFenêtreAttachée();
    ipcRenderer.send(CODE_MESSAGE_POUR_CLIENT, message);
};
export const écouterMessagesDeConstellation = (f) => {
    const écouteur = (_event, ...args) => {
        f(...args);
    };
    ipcRenderer.on(CODE_MESSAGE_DE_CLIENT, écouteur);
    return () => ipcRenderer.off(CODE_MESSAGE_DE_CLIENT, écouteur);
};
export const messageÀServeurConstellation = (message) => {
    ipcRenderer.send(CODE_MESSAGE_POUR_SERVEUR, message);
};
export const écouterMessagesDeServeurConstellation = (f) => {
    const écouteur = (_event, ...args) => {
        f(...args);
    };
    ipcRenderer.on(CODE_MESSAGE_DE_SERVEUR, écouteur);
    return () => ipcRenderer.off(CODE_MESSAGE_DE_SERVEUR, écouteur);
};
//# sourceMappingURL=pr%C3%A9chargeur.js.map
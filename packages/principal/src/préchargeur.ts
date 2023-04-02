import { ipcRenderer, IpcRendererEvent } from "electron";

import type { mandataire } from "@constl/ipa";
import {
  CODE_CLIENT_PRÊT,
  CODE_MESSAGE_DE_CLIENT,
  CODE_MESSAGE_DE_SERVEUR,
  CODE_MESSAGE_POUR_CLIENT,
  CODE_MESSAGE_POUR_SERVEUR,
  messageDeServeur,
  messagePourServeur,
} from "@/messages.js";

let attachée = false; // À faire: selon l'ID de la fenêtre

export const attendreFenêtreAttachée = (): Promise<void> => {
  return new Promise<void>((résoudre) => {
    if (attachée) résoudre();
    ipcRenderer.once(CODE_CLIENT_PRÊT, () => {
      attachée = true;
      résoudre();
    });
  });
};

export const envoyerMessageÀConstellation = async (
  message: mandataire.messages.MessagePourTravailleur
) => {
  // Nécessaire parce que la fenêtre Électron peut être initialisée avant d'être connectée à Constellation
  await attendreFenêtreAttachée();
  ipcRenderer.send(CODE_MESSAGE_POUR_CLIENT, message);
};

export const écouterMessagesDeConstellation = (
  f: (message: mandataire.messages.MessageDeTravailleur) => void
): (() => void) => {
  const écouteur = (
    _event: IpcRendererEvent,
    ...args: [mandataire.messages.MessageDeTravailleur]
  ) => {
    f(...args);
  };
  ipcRenderer.on(CODE_MESSAGE_DE_CLIENT, écouteur);
  return () => ipcRenderer.off(CODE_MESSAGE_DE_CLIENT, écouteur);
};

export const envoyerMessageÀServeurConstellation = (
  message: messagePourServeur
) => {
  ipcRenderer.send(CODE_MESSAGE_POUR_SERVEUR, message);
};

export const écouterMessagesDeServeurConstellation = (
  f: (message: messageDeServeur) => void
): (() => void) => {
  const écouteur = (_event: IpcRendererEvent, ...args: [messageDeServeur]) => {
    f(...args);
  };
  ipcRenderer.on(CODE_MESSAGE_DE_SERVEUR, écouteur);
  return () => ipcRenderer.off(CODE_MESSAGE_DE_SERVEUR, écouteur);
};

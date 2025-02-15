import type { MessageDIpa, MessagePourIpa } from "@constl/mandataire";
import type { IpcRendererEvent } from "electron";
import electron from "electron";
import lodash from "lodash";

import {
  CODE_MESSAGE_D_IPA,
  CODE_MESSAGE_DE_SERVEUR,
  CODE_MESSAGE_POUR_IPA,
  CODE_MESSAGE_POUR_SERVEUR,
  messageDeServeur,
  messagePourServeur,
} from "@/messages.js";

const { cloneDeep } = lodash;
const { ipcRenderer } = electron;

export const envoyerMessageÀConstellation = async (message: MessagePourIpa) => {
  // `cloneDeep` évite les erreurs avec les mandataires d'objet réactifs dans Vue.js
  ipcRenderer.send(CODE_MESSAGE_POUR_IPA, cloneDeep(message));
};

export const écouterMessagesDeConstellation = (
  f: (message: MessageDIpa) => void,
): (() => void) => {
  const écouteur = (_event: IpcRendererEvent, ...args: [MessageDIpa]) => {
    f(...args);
  };
  ipcRenderer.on(CODE_MESSAGE_D_IPA, écouteur);
  return () => ipcRenderer.off(CODE_MESSAGE_D_IPA, écouteur);
};

export const envoyerMessageÀServeurConstellation = async (
  message: messagePourServeur,
) => {
  // `cloneDeep` évite les erreurs avec les mandataires d'objet réactifs dans Vue.js
  ipcRenderer.send(CODE_MESSAGE_POUR_SERVEUR, cloneDeep(message));
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

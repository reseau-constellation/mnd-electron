export const CODE_MESSAGE_POUR_SERVEUR = "pourServeur";
export const CODE_MESSAGE_DE_SERVEUR = "deServeur"
export const CODE_MESSAGE_POUR_CLIENT = 'pourClient';
export const CODE_MESSAGE_DE_CLIENT = 'deClient';
export const CODE_CLIENT_PRÊT = "clientPrêt"
export type messagePourServeur = messageInitServeur | messageFermerServeur;

export type messageInitServeur = {
  type: 'init';
  port?: number;
};

export type messageFermerServeur = {
  type: 'fermer';
};

export type messageDeServeur = messagePrêtDeServeur;

export type messagePrêtDeServeur = {
  type: 'prêt';
  port: number;
};
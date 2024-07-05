export const CODE_MESSAGE_POUR_SERVEUR = "pourServeur";
export const CODE_MESSAGE_DE_SERVEUR = "deServeur";
export const CODE_MESSAGE_POUR_IPA = "pourIpa";
export const CODE_MESSAGE_D_IPA = "dIPA";
export const CODE_CLIENT_PRÊT = "clientPrêt";
export type messagePourServeur =
  | messageInitServeur
  | messageFermerServeur
  | messageAuthServeur;

export type messageInitServeur = {
  type: "init";
  port?: number;
};

export type messageFermerServeur = {
  type: "fermer";
};

export type messageAuthServeur<
  T extends contenuRequêteAuthServeur = contenuRequêteAuthServeur,
> = {
  type: "auth";
  contenu: T;
};

export type contenuRequêteAuthServeur =
  | suivreRequêtesAuthServeur
  | approuverRequêteAuthServeur
  | refuserRequêteAuthServeur
  | oublierRequêtesAuthServeur;

export type suivreRequêtesAuthServeur = {
  type: "suivreRequêtes";
  idSuivi: string;
};

export type oublierRequêtesAuthServeur = {
  type: "oublierRequêtes";
  idSuivi: string;
};

export type approuverRequêteAuthServeur = {
  type: "approuverRequête";
  idRequête: string;
};

export type refuserRequêteAuthServeur = {
  type: "refuserRequête";
  idRequête: string;
};

export type messageDeServeur = messagePrêtDeServeur | messageRequêtesConnexion;

export type messagePrêtDeServeur = {
  type: "prêt";
  port: number;
  codeSecret: string;
};

export type messageRequêtesConnexion = {
  type: "requêtesConnexion";
  requêtes: string[];
};

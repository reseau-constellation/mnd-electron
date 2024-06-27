export const CODE_MESSAGE_POUR_SERVEUR = "pourServeur";
export const CODE_MESSAGE_DE_SERVEUR = "deServeur";
export const CODE_MESSAGE_POUR_IPA = "pourIpa";
export const CODE_MESSAGE_D_IPA = "dIPA";
export const CODE_CLIENT_PRÊT = "clientPrêt";
export type messagePourServeur = messageInitServeur | messageFermerServeur | messageAuthServeur;

export type messageInitServeur = {
  type: "init";
  port?: number;
};

export type messageFermerServeur = {
  type: "fermer";
};

export type messageAuthServeur = {
  type: "auth";
  contenu: suivreRequètesAuthServeur | approuverRequèteAuthServeur | refuserRequèteAuthServeur | oublierRequètesAuthServeur;
}

export type suivreRequètesAuthServeur = {
  type: "suivreRequètes";
  idSuivi: string;
}

export type oublierRequètesAuthServeur = {
  type: "oublierRequètes";
  idSuivi: string;
}

export type approuverRequèteAuthServeur = {
  type: "approuverRequète";
  idRequète: string;
}

export type refuserRequèteAuthServeur = {
  type: "refuserRequète";
  idRequète: string;
}

export type messageDeServeur = messagePrêtDeServeur | messageRequètesConnexion;

export type messagePrêtDeServeur = {
  type: "prêt";
  port: number;
  codeSecret: string;
};

export type messageRequètesConnexion = {
  type: "requètesConnexion";
  requètes: string[];
}

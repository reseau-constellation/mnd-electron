import { v4 as uuidv4 } from "uuid";
import type {
  messageInitServeur,
  messageFermerServeur,
  messageAuthServeur,
  suivreRequêtesAuthServeur,
  oublierRequêtesAuthServeur,
  refuserRequêteAuthServeur,
  approuverRequêteAuthServeur,
  envoyerMessageÀServeurConstellation as _envoyerMessageÀServeurConstellation,
  écouterMessagesDeServeurConstellation as _écouterMessagesDeServeurConstellation,
} from "@constl/mandataire-electron-principal";

export class GestionnaireServeur {
  envoyerMessageÀServeurConstellation: typeof _envoyerMessageÀServeurConstellation;
  écouterMessagesDeServeurConstellation: typeof _écouterMessagesDeServeurConstellation;

  constructor({
    écouterMessagesDeServeurConstellation,
    envoyerMessageÀServeurConstellation,
  }: {
    écouterMessagesDeServeurConstellation: typeof _écouterMessagesDeServeurConstellation;
    envoyerMessageÀServeurConstellation: typeof _envoyerMessageÀServeurConstellation;
  }) {
    this.envoyerMessageÀServeurConstellation =
      envoyerMessageÀServeurConstellation;
    this.écouterMessagesDeServeurConstellation =
      écouterMessagesDeServeurConstellation;
  }

  async initialiser(port?: number): Promise<number> {
    const messageInit: messageInitServeur = {
      type: "init",
      port,
    };

    let oublierÉcoute: (() => void) | undefined = undefined;
    const promessePort = new Promise<number>((résoudre) => {
      oublierÉcoute = this.écouterMessagesDeServeurConstellation((message) => {
        if (message.type === "prêt") {
          oublierÉcoute?.();
          résoudre(message.port);
        }
      });
    });
    this.envoyerMessageÀServeurConstellation(messageInit);

    return await promessePort;
  }

  async suivreRequêtesAuthServeur({
    f,
  }: {
    f: (r: string[]) => void;
  }): Promise<() => void> {
    const idSuivi = uuidv4();
    const messageSuivreRequêtes: messageAuthServeur<suivreRequêtesAuthServeur> =
      {
        type: "auth",
        contenu: {
          type: "suivreRequêtes",
          idSuivi,
        },
      };
    this.envoyerMessageÀServeurConstellation(messageSuivreRequêtes);

    const oublierÉcoute = this.écouterMessagesDeServeurConstellation(
      (message) => {
        if (message.type === "requêtesConnexion") f(message.requêtes);
      },
    );
    const oublier = () => {
      const messageOublierRequêtes: messageAuthServeur<oublierRequêtesAuthServeur> =
        {
          type: "auth",
          contenu: {
            type: "oublierRequêtes",
            idSuivi,
          },
        };
      this.envoyerMessageÀServeurConstellation(messageOublierRequêtes);
      oublierÉcoute();
    };
    return oublier;
  }

  async approuverRequêteAuthServeur({ idRequête }: { idRequête: string }) {
    const messageApprouverRequête: messageAuthServeur<approuverRequêteAuthServeur> =
      {
        type: "auth",
        contenu: {
          type: "approuverRequête",
          idRequête,
        },
      };
    this.envoyerMessageÀServeurConstellation(messageApprouverRequête);
  }

  async refuserRequêteAuthServeur({ idRequête }: { idRequête: string }) {
    const messageRefuserRequête: messageAuthServeur<refuserRequêteAuthServeur> =
      {
        type: "auth",
        contenu: {
          type: "refuserRequête",
          idRequête,
        },
      };
    this.envoyerMessageÀServeurConstellation(messageRefuserRequête);
  }

  async fermer() {
    const messageFermer: messageFermerServeur = {
      type: "fermer",
    };
    this.envoyerMessageÀServeurConstellation(messageFermer);
  }
}

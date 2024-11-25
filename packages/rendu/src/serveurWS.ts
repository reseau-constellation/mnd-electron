import type {
  envoyerMessageÀServeurConstellation as _envoyerMessageÀServeurConstellation,
  écouterMessagesDeServeurConstellation as _écouterMessagesDeServeurConstellation,
  approuverRequêteAuthServeur,
  messageAuthServeur,
  messageFermerServeur,
  messageInitServeur,
  messagePrêtDeServeur,
  oublierConnexionsAuthServeur,
  oublierRequêtesAuthServeur,
  refuserRequêteAuthServeur,
  révoquerAccèsAuthServeur,
  suivreConnexionsAuthServeur,
  suivreRequêtesAuthServeur,
} from "@constl/mandataire-electron-principal";
import { v4 as uuidv4 } from "uuid";
import { ÉtatServeur, ÉtatServeurActif, ÉtatServeurFermé } from "./types";

export class GestionnaireServeur {
  envoyerMessageÀServeurConstellation: typeof _envoyerMessageÀServeurConstellation;
  écouterMessagesDeServeurConstellation: typeof _écouterMessagesDeServeurConstellation;
  état: ÉtatServeur;

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

    // On commence avec le serveur fermé
    this.état = {
      état: "fermé",
    };
    this.suivreÉtatServeur({ f: (état) => (this.état = état) });
  }

  async initialiser(
    port?: number,
  ): Promise<{ port: number; codeSecret: string }> {
    const messageInit: messageInitServeur = {
      type: "init",
      port,
    };

    let oublierÉcoute: (() => void) | undefined = undefined;
    const promesseServeur = new Promise<messagePrêtDeServeur>((résoudre) => {
      oublierÉcoute = this.écouterMessagesDeServeurConstellation((message) => {
        if (message.type === "prêt") {
          oublierÉcoute?.();
          résoudre(message);
        }
      });
    });
    this.envoyerMessageÀServeurConstellation(messageInit);

    const { port: portFinal, codeSecret } = await promesseServeur;
    return { port: portFinal, codeSecret };
  }

  suivreÉtatServeur({ f }: { f: (r: ÉtatServeur) => void }): () => void {
    f(this.état);

    const oublierÉcoute = this.écouterMessagesDeServeurConstellation(
      (message) => {
        if (message.type === "prêt") {
          const état: ÉtatServeurActif = {
            état: "actif",
            détails: {
              port: message.port,
              codeSecret: message.codeSecret,
            },
          };
          f(état);
        } else if (message.type === "fermé") {
          const état: ÉtatServeurFermé = {
            état: "fermé",
          };
          f(état);
        }
      },
    );

    return oublierÉcoute;
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

  async suivreConnexionsAuthServeur({
    f,
  }: {
    f: (r: string[]) => void;
  }): Promise<() => void> {
    const idSuivi = uuidv4();
    const messageSuivreRequêtes: messageAuthServeur<suivreConnexionsAuthServeur> =
      {
        type: "auth",
        contenu: {
          type: "suivreConnexions",
          idSuivi,
        },
      };
    this.envoyerMessageÀServeurConstellation(messageSuivreRequêtes);

    const oublierÉcoute = this.écouterMessagesDeServeurConstellation(
      (message) => {
        if (message.type === "connexions") f(message.connexions);
      },
    );
    const oublier = () => {
      const messageOublierRequêtes: messageAuthServeur<oublierConnexionsAuthServeur> =
        {
          type: "auth",
          contenu: {
            type: "oublierConnexions",
            idSuivi,
          },
        };
      this.envoyerMessageÀServeurConstellation(messageOublierRequêtes);
      oublierÉcoute();
    };
    return oublier;
  }

  async révoquerAccèsServeur({ idRequête }: { idRequête: string }) {
    const messageRévoquerAccès: messageAuthServeur<révoquerAccèsAuthServeur> = {
      type: "auth",
      contenu: {
        type: "révoquerAccès",
        idRequête,
      },
    };
    this.envoyerMessageÀServeurConstellation(messageRévoquerAccès);
  }

  async fermer() {
    const messageFermer: messageFermerServeur = {
      type: "fermer",
    };
    this.envoyerMessageÀServeurConstellation(messageFermer);
  }
}

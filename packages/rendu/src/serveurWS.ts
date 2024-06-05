import { EventEmitter, once } from "events";
import type {
  messageInitServeur,
  messageFermerServeur,
  envoyerMessageÀServeurConstellation as _envoyerMessageÀServeurConstellation,
  écouterMessagesDeServeurConstellation as _écouterMessagesDeServeurConstellation,
} from "@constl/mandataire-electron-principal";

const CODE_PRÊT = "prêt";

export class GestionnaireServeur {
  envoyerMessageÀServeurConstellation: typeof _envoyerMessageÀServeurConstellation;
  événements: EventEmitter;

  constructor({
    écouterMessagesDeServeurConstellation,
    envoyerMessageÀServeurConstellation,
  }: {
    écouterMessagesDeServeurConstellation: typeof _écouterMessagesDeServeurConstellation;
    envoyerMessageÀServeurConstellation: typeof _envoyerMessageÀServeurConstellation;
  }) {
    this.événements = new EventEmitter();
    this.envoyerMessageÀServeurConstellation =
      envoyerMessageÀServeurConstellation;

    écouterMessagesDeServeurConstellation((message) => {
      if (message.type === "prêt")
        this.événements.emit(CODE_PRÊT, message.port);
    });
  }

  async initialiser(port?: number): Promise<number> {
    const messageInit: messageInitServeur = {
      type: "init",
      port,
    };
    const promessePort = once(
      this.événements,
      CODE_PRÊT,
    ) as unknown as Promise<number>;
    this.envoyerMessageÀServeurConstellation(messageInit);

    return await promessePort;
  }

  async fermer() {
    const messageFermer: messageFermerServeur = {
      type: "fermer",
    };
    this.envoyerMessageÀServeurConstellation(messageFermer);
  }
}

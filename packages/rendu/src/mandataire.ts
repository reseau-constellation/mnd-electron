import type { mandataire } from "@constl/ipa";
import type {
  envoyerMessageÀConstellation as _envoyerMessageÀConstellation,
  écouterMessagesDeConstellation as _écouterMessagesDeConstellation,
} from "@constl/mandataire-electron-principal";

import { ClientMandatairifiable, générerMandataire } from "@constl/mandataire";

export class MandataireClientÉlectronPrincipal extends ClientMandatairifiable {
  envoyerMessageÀConstellation: typeof _envoyerMessageÀConstellation;
  journal?: (msg: string) => void;

  constructor({
    écouterMessagesDeConstellation,
    envoyerMessageÀConstellation,
    journal,
  }: {
    écouterMessagesDeConstellation: typeof _écouterMessagesDeConstellation;
    envoyerMessageÀConstellation: typeof _envoyerMessageÀConstellation;
    journal?: (msg: string) => void;
  }) {
    super();
    this.envoyerMessageÀConstellation = envoyerMessageÀConstellation;
    this.journal = journal;

    écouterMessagesDeConstellation(
      (m: mandataire.messages.MessageDeTravailleur) => {
        console.log("ici")
        if (this.journal)
          this.journal(
            "Rendu : message de Constellation : " + JSON.stringify(m)
          );
        this.événements.emit("message", m);
      }
    );
  }

  envoyerMessage(message: mandataire.messages.MessagePourTravailleur): void {
    if (this.journal)
      this.journal(
        "Rendu : message pour Constellation : " + JSON.stringify(message)
      );
    this.envoyerMessageÀConstellation(message);
  }
}

export const générerMandataireÉlectronPrincipal = ({
  écouterMessagesDeConstellation,
  envoyerMessageÀConstellation,
  journal,
}: {
  écouterMessagesDeConstellation: typeof _écouterMessagesDeConstellation;
  envoyerMessageÀConstellation: typeof _envoyerMessageÀConstellation;
  journal?: (msg: string) => void;
}) => {
  return générerMandataire(
    new MandataireClientÉlectronPrincipal({
      écouterMessagesDeConstellation,
      envoyerMessageÀConstellation,
      journal,
    })
  );
};

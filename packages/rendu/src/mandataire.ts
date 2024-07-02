import type {
  MessageDIpa, MessagePourIpa
} from "@constl/mandataire";
import type {
  envoyerMessageÀConstellation as _envoyerMessageÀConstellation,
  écouterMessagesDeConstellation as _écouterMessagesDeConstellation,
} from "@constl/mandataire-electron-principal";

import { Mandatairifiable, générerMandataire } from "@constl/mandataire";

export class MandataireClientÉlectronPrincipal extends Mandatairifiable {
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
      (m: MessageDIpa) => {
        if (this.journal)
          this.journal(
            "Rendu : message reçu de Constellation : " + JSON.stringify(m),
          );
        this.recevoirMessageDIpa(m);
      },
    );
  }

  envoyerMessageÀIpa(message: MessagePourIpa): void {
    if (this.journal)
      this.journal(
        "Rendu : message pour Constellation : " + JSON.stringify(message),
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
    }),
  );
};

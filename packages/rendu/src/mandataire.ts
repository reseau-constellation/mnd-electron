import type {proxy} from '@constl/ipa';
import type { 
  envoyerMessageÀConstellation as _envoyerMessageÀConstellation,
  écouterMessagesDeConstellation as _écouterMessagesDeConstellation,
} from "@constl/mandataire-electron-principal"

import { 
  ClientMandatairifiable,
  générerMandataire,
} from "@constl/mandataire"


export class MandataireClientÉlectronPrincipal extends ClientMandatairifiable {
  envoyerMessageÀConstellation: typeof _envoyerMessageÀConstellation;

  constructor({
    écouterMessagesDeConstellation,
    envoyerMessageÀConstellation
  }: {
    écouterMessagesDeConstellation: typeof _écouterMessagesDeConstellation;
    envoyerMessageÀConstellation: typeof _envoyerMessageÀConstellation;
  }) {
    super();
    this.envoyerMessageÀConstellation = envoyerMessageÀConstellation

    écouterMessagesDeConstellation((m: proxy.messages.MessageDeTravailleur) => {
      this.événements.emit('message', m);
    });
  }

  envoyerMessage(message: proxy.messages.MessagePourTravailleur): void {
    this.envoyerMessageÀConstellation(message);
  }
}

export const générerMandataireÉlectronPrincipal = ({
  écouterMessagesDeConstellation,
  envoyerMessageÀConstellation
}: {
  écouterMessagesDeConstellation: typeof _écouterMessagesDeConstellation;
  envoyerMessageÀConstellation: typeof _envoyerMessageÀConstellation;
}) => {
  return générerMandataire(new MandataireClientÉlectronPrincipal({
    écouterMessagesDeConstellation,
    envoyerMessageÀConstellation
  }))
}
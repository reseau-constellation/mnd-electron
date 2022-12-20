import type {proxy} from '@constl/ipa';
import type { 
  messageÀConstellation,
  écouterMessagesDeConstellation,
} from "@constl/mandataire-electron-principal"

import { 
  ClientMandatairifiable,
  générerMandataire,
} from "@constl/mandataire"


export class MandataireClientÉlectronPrincipal extends ClientMandatairifiable {
  messageÀConstellation: typeof messageÀConstellation;

  constructor({
    fÉcouterMessagesDeConstellation,
    fMessageÀConstellation
  }: {
    fÉcouterMessagesDeConstellation: typeof écouterMessagesDeConstellation;
    fMessageÀConstellation: typeof messageÀConstellation;
  }) {
    super();
    this.messageÀConstellation = fMessageÀConstellation

    fÉcouterMessagesDeConstellation((m: proxy.messages.MessageDeTravailleur) => {
      this.événements.emit('message', m);
    });
  }

  envoyerMessage(message: proxy.messages.MessagePourTravailleur): void {
    this.messageÀConstellation(message);
  }
}

export const générerMandataireÉlectronPrincipal = ({
  fÉcouterMessagesDeConstellation,
  fMessageÀConstellation
}: {
  fÉcouterMessagesDeConstellation: typeof écouterMessagesDeConstellation;
  fMessageÀConstellation: typeof messageÀConstellation;
}) => {
  return générerMandataire(new MandataireClientÉlectronPrincipal({
    fÉcouterMessagesDeConstellation,
    fMessageÀConstellation
  }))
}
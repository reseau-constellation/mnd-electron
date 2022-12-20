import type {proxy} from '@constl/ipa';
import type { 
  préchargeur
} from "@constl/mandataire-electron-principal"

import { 
  ClientMandatairifiable,
  générerMandataire,
} from "@constl/mandataire"


export class MandataireClientÉlectronPrincipal extends ClientMandatairifiable {
  messageÀConstellation: préchargeur.messageÀConstellation;

  constructor({
    écouterMessagesDeConstellation,
    messageÀConstellation
  }: {
    écouterMessagesDeConstellation: préchargeur.écouterMessagesDeConstellation;
    messageÀConstellation: préchargeur.messageÀConstellation;
  }) {
    super();
    this.messageÀConstellation = messageÀConstellation

    écouterMessagesDeConstellation((m: proxy.messages.MessageDeTravailleur) => {
      this.événements.emit('message', m);
    });
  }

  envoyerMessage(message: proxy.messages.MessagePourTravailleur): void {
    this.messageÀConstellation(message);
  }
}

export const générerMandataireÉlectronPrincipal = ({
  écouterMessagesDeConstellation,
  messageÀConstellation
}: {
  écouterMessagesDeConstellation: préchargeur.écouterMessagesDeConstellation;
  messageÀConstellation: préchargeur.messageÀConstellation;
}) => {
  return générerMandataire(new MandataireClientÉlectronPrincipal({
    écouterMessagesDeConstellation,
    messageÀConstellation
  }))
}
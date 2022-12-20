import {EventEmitter, once} from 'events';
import type {
    messageInitServeur,
    messageFermerServeur,
    préchargeur,
} from "@constl/mandataire-electron-principal";

const CODE_PRÊT = "prêt";

export class GestionnaireServeur {
    messageÀServeurConstellation: préchargeur.messageÀServeurConstellation;
    événements: EventEmitter;
  
    constructor({
        écouterMessagesDeServeurConstellation,
        messageÀServeurConstellation
    }: {
        écouterMessagesDeServeurConstellation: préchargeur.écouterMessagesDeServeurConstellation;
        messageÀServeurConstellation: préchargeur.messageÀServeurConstellation;
    }) {
      this.événements = new EventEmitter();
      this.messageÀServeurConstellation = messageÀServeurConstellation;

      écouterMessagesDeServeurConstellation(message => {
        if (message.type === 'prêt') this.événements.emit(CODE_PRÊT, message.port);
      });
    }

    async initialiser(port?: number): Promise<number> {
        const messageInit: messageInitServeur = {
            type: 'init',
            port,
        };
        const promessePort = once(
            this.événements, 
            CODE_PRÊT
        ) as unknown as Promise<number>;
        this.messageÀServeurConstellation(messageInit);
  
        return await promessePort;
    }
  
    async fermer() {
      const messageFermer: messageFermerServeur = {
        type: 'fermer',
      };
      this.messageÀServeurConstellation(messageFermer);
    }
  }
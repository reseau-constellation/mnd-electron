import { EventEmitter, once } from 'events';
const CODE_PRÊT = "prêt";
export class GestionnaireServeur {
    messageÀServeurConstellation;
    événements;
    constructor({ écouterMessagesDeServeurConstellation, messageÀServeurConstellation }) {
        this.événements = new EventEmitter();
        this.messageÀServeurConstellation = messageÀServeurConstellation;
        écouterMessagesDeServeurConstellation(message => {
            if (message.type === 'prêt')
                this.événements.emit(CODE_PRÊT, message.port);
        });
    }
    async initialiser(port) {
        const messageInit = {
            type: 'init',
            port,
        };
        const promessePort = once(this.événements, CODE_PRÊT);
        this.messageÀServeurConstellation(messageInit);
        return await promessePort;
    }
    async fermer() {
        const messageFermer = {
            type: 'fermer',
        };
        this.messageÀServeurConstellation(messageFermer);
    }
}
//# sourceMappingURL=serveurWS.js.map
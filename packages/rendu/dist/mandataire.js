import { ClientMandatairifiable, générerMandataire, } from "@constl/mandataire";
export class MandataireClientÉlectronPrincipal extends ClientMandatairifiable {
    messageÀConstellation;
    constructor({ écouterMessagesDeConstellation, messageÀConstellation }) {
        super();
        this.messageÀConstellation = messageÀConstellation;
        écouterMessagesDeConstellation((m) => {
            this.événements.emit('message', m);
        });
    }
    envoyerMessage(message) {
        this.messageÀConstellation(message);
    }
}
export const générerMandataireÉlectronPrincipal = ({ écouterMessagesDeConstellation, messageÀConstellation }) => {
    return générerMandataire(new MandataireClientÉlectronPrincipal({
        écouterMessagesDeConstellation,
        messageÀConstellation
    }));
};
//# sourceMappingURL=mandataire.js.map
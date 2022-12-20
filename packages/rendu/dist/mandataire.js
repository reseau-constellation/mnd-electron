import { ClientMandatairifiable, générerMandataire, } from "@constl/mandataire";
export class MandataireClientÉlectronPrincipal extends ClientMandatairifiable {
    messageÀConstellation;
    constructor({ fÉcouterMessagesDeConstellation, fMessageÀConstellation }) {
        super();
        this.messageÀConstellation = fMessageÀConstellation;
        fÉcouterMessagesDeConstellation((m) => {
            this.événements.emit('message', m);
        });
    }
    envoyerMessage(message) {
        this.messageÀConstellation(message);
    }
}
export const générerMandataireÉlectronPrincipal = ({ fÉcouterMessagesDeConstellation, fMessageÀConstellation }) => {
    return générerMandataire(new MandataireClientÉlectronPrincipal({
        fÉcouterMessagesDeConstellation,
        fMessageÀConstellation
    }));
};
//# sourceMappingURL=mandataire.js.map
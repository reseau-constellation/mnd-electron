import type {Constellation} from '@constl/ipa';
import type {GestionnaireServeur} from '@constl/mandataire-electron-rendu';

import {inject} from 'vue';

export const utiliserConstellation = (): Constellation => {
  const constl = inject<Constellation>('constl');
  if (constl) return constl;
  throw new Error("Constellation n'est pas trouvable.");
};

export const utiliserServeurLocalConstellation = (): GestionnaireServeur => {
  const serveur = inject<GestionnaireServeur>('serveurConstl');
  if (serveur) return serveur;
  throw new Error("Serveur local Constellation n'est pas trouvable.");
};

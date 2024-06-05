import {GestionnaireFenêtres} from '@constl/mandataire-electron-principal';

const importationIPA = import('@constl/ipa');
const importationServeur = import('@constl/serveur');

// Avec ça, on peut spécifier le dossier Constellation dans les tests
const opts = process.env.DOSSIER_CONSTL ? {dossier: process.env.DOSSIER_CONSTL} : undefined;

export const gestionnaireFenêtres = new GestionnaireFenêtres({
  enDéveloppement: true,
  importationIPA,
  importationServeur,
  journal: console.log,
  opts,
});

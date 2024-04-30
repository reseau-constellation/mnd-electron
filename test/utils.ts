import type {ElectronApplication, Page} from 'playwright';
import {_electron as electron} from 'playwright';

import {dossiers} from '@constl/utils-tests';


export const surÉlectron = async (): Promise<{
  appli: ElectronApplication;
  page: Page;
  fermer: () => Promise<void>;
}> => {
  // Utiliser un dossier temporaire pour le compte Constellation dans les tests
  const {dossier, fEffacer} = await dossiers.dossierTempo();

  // Inclure {...process.env} est nécessaire pour les tests sur Linux
  const appli = await electron.launch({
    args: ['.'],
    env: {...process.env, DOSSIER_CONSTL: dossier},
  });
  const page = await appli.firstWindow();

  const fermer = async () => {
    try {
      await appli.close();
    } finally {
      fEffacer?.();
    }
  };

  return {appli, page, fermer};
};

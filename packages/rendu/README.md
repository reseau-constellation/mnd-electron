# Mandataire Constellation : Processus Rendu Électron

À utiliser avec `@constl/mandataire-electron-principal` dans le processus Électron principal.

## Installation

## Utilisation

```TypeScript
import {
  envoyerMessageÀConstellation,
  écouterMessagesDeConstellation,
  envoyerMessageÀServeurConstellation,
  écouterMessagesDeServeurConstellation,
} from '#preload';
import type {App} from 'vue';
import {
  générerMandataireÉlectronPrincipal,
  GestionnaireServeur,
} from '@constl/mandataire-electron-rendu';

export default {
  install: (app: App) => {
    app.provide('constl', générerMandataireÉlectronPrincipal({
      envoyerMessageÀConstellation,
      écouterMessagesDeConstellation,
    }));

    // Uniquement si vous voulez aussi activer un serveur WS local.
    app.provide('serveurConstl', new GestionnaireServeur({
      écouterMessagesDeServeurConstellation,
      envoyerMessageÀServeurConstellation,
    }));
  },
};

```

Vous pouvez maintenant utiliser Constellation directement dans votre application Électron :

```TypeScript
import { inject } from 'vue';

const constellation = inject('constl');
const idBd = await constellation.bds.créerBd({ licence: 'ODbl-1_0' });
```

Vous pouvez également activer le serveur WS local, ce qui rendra l'instance de Constellation de votre appli
également accessible à d'autres programmes locaux sur votre ordinateur. Ceci permet, par exemple,
de connecter un client [Python](https://github.com/reseau-constellation/client-python) ou 
[Julia]((https://github.com/reseau-constellation/Constellation.js) à l'instance Constellation de votre appli.

```TypeScript
import { inject } from 'vue';

const serveur = inject('serveurConstl');
const port = await serveur.initialiser();  // Ou spécifier le port avec serveur.initialiser(PORT);
await serveur.fermer()  // Quand on a fini
```

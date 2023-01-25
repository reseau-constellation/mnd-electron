# Mandataire Constellation : Processus Principal Électron

À utiliser avec `@constl/mandataire-electron-rendu` dans le processus de rendu Électron.

## Installation

## Utilisation : processus principal

Dans un fichier séparé, initialisez le gestionnaire qui connectra les fenêtres de votre appli Éllectron à Constellation.

```TypeScript
// constellation.ts
import { GestionnaireFenêtres } from '@constl/mandataire-electron-principal';

const enDéveloppement = process.env.NODE_ENV !== 'production';

const importationIPA = import('@constl/ipa');
const importationServeur = import('@constl/serveur');

export const gestionnaireFenêtres = new GestionnaireFenêtres({ 
  enDéveloppement,
  importationIPA,
  importationServeur,
});
```

Connecter chaque nouvelle fenêtre de votre appli à Constellation au moment où vous la créez :
```TypeScript
// main.ts
import {BrowserWindow} from 'electron';

fenêtre = new BrowserWindow();
gestionnaireFenêtres.connecterFenêtreÀConstellation(fenêtre);
```

Et surtout, n'oubliez pas de fermer Constellation lorsqu'on a fini.

```TypeScript
// main.ts
app.on('will-quit', async () => {
  await gestionnaireFenêtres.fermerConstellation();
});
```

## Utilisation : préchargeur

Dans votre code préchargeur, vous devez exposer les fonctions suivantes avec `electron.contextBridge.exposeInMainWorld`. Nous recommandons [unplugin-auto-expose](https://www.npmjs.com/package/unplugin-auto-expose), qui simplifie grandement la tâche.

```TypeScript
// preload.ts

export {
  envoyerMessageÀConstellation,
  écouterMessagesDeConstellation,
  envoyerMessageÀServeurConstellation,  // Uniquement si vous voulez inclure le serveur WS
  écouterMessagesDeServeurConstellation,  // Uniquement si vous voulez inclure le serveur WS
} from '@constl/mandataire-electron-principal';
```

## Utilisation : préchargeur

Dans votre code préchargeur, vous devez exposer les fonctions suivantes avec `electron.contextBridge.exposeInMainWorld`. Nous recommandons [unplugin-auto-expose](https://www.npmjs.com/package/unplugin-auto-expose), qui simplifie grandement la tâche.

```TypeScript
// preload.ts

export {
  envoyerMessageÀConstellation,
  écouterMessagesDeConstellation,
  envoyerMessageÀServeurConstellation,  // Uniquement si vous voulez inclure le serveur WS
  écouterMessagesDeServeurConstellation,  // Uniquement si vous voulez inclure le serveur WS
} from '@constl/mandataire-electron-principal';
```

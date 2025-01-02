<script lang="ts" setup>
import {obt, suivre} from '@constl/vue';
import {utiliserConstellation, utiliserServeurLocalConstellation} from './utils';

const constl = utiliserConstellation();
const serveur = utiliserServeurLocalConstellation();

// Fonctionalités Constellation
const id = obt(constl.obtIdCompte);
const noms = suivre(constl.profil.suivreNoms);

const ajouterNom = async () => {
  await constl.profil.sauvegarderNom({langue: 'fr', nom: 'Moi'});
};

// Fonctionalités serveur local
const état = suivre(serveur.suivreÉtatServeur.bind(serveur));
const changer = async () => {
  if (état.value?.état === 'actif') await serveur.fermer();
  else await serveur.initialiser();
};

const requêtes = suivre(serveur.suivreRequêtesAuthServeur.bind(serveur));
const connexions = suivre(serveur.suivreConnexionsAuthServeur.bind(serveur));
</script>

<template>
  <h1>Tests IPA</h1>
  <p>
    Id:
    <span
      v-if="id"
      id="id-compte"
    >
      {{ id }}
    </span>
  </p>
  <p>
    Noms:
    <span
      v-if="noms && Object.keys(noms).length"
      id="noms-profil"
    >
      {{ noms }}
    </span>
  </p>
  <button
    id="btn-ajout-nom"
    @click="() => ajouterNom()"
  />
  <h1>Tests serveur local</h1>
  <p>
    <span id="état-serveur">
      {{ état }}
    </span>
  </p>
  <button
    id="btn-changer-serveur"
    @click="() => changer()"
  />
  <p>
    <span id="requêtes">
      {{ requêtes }}
    </span>
  </p>
  <p>
    <span id="connexions">
      {{ connexions }}
    </span>
  </p>
</template>

<style></style>

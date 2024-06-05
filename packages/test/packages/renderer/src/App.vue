<script lang="ts" setup>
import {constellation, obt, suivre} from './utils';

const constl = constellation();

const id = obt(constl.obtIdCompte);
const noms = suivre(constl.profil.suivreNoms);

const ajouterNom = async () => {
  await constl.profil.sauvegarderNom({langue: 'fr', nom: 'Moi'});
};
</script>

<template>
  <v-app>
    <v-locale-provider>
      <v-main>
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
            v-if="noms"
            id="noms-profil"
          >
            {{ noms }}
          </span>
        </p>
        <button
          id="btn-ajout-nom"
          @click="() => ajouterNom()"
        />
      </v-main>
    </v-locale-provider>
  </v-app>
</template>
<style></style>

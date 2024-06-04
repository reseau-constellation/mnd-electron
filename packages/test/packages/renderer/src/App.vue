<script lang="ts" setup>
import { constellation, obt, suivre } from './utils';

const constl = constellation();

const id = obt(constl.obtIdCompte);
const noms = suivre(constl.profil.suivreNoms);

</script>

<template>
  <v-app>
    <v-locale-provider>
      <v-main>
        Id: <p>{{ id }}</p>
        Noms:  <p>{{ noms }}</p>
      </v-main>
    </v-locale-provider>
  </v-app>
</template>

<style></style>

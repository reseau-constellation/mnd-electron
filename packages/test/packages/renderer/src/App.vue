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
        <p>
          Id: 
          <span
            v-if="id"
            id="id-compte"
          >{{ id }}</span>
        </p>
        Noms:  <p>{{ noms }}</p>
      </v-main>
    </v-locale-provider>
  </v-app>
</template>

<style></style>

import {createApp} from 'vue';
import constellationÉlectron from './plugins/constellation/électron';
import App from '/@/App.vue';

const appli = createApp(App);

appli.use(constellationÉlectron);

appli.mount('#app');

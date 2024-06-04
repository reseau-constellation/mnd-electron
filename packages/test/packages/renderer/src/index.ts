import {createApp} from 'vue';
import App from '/@/App.vue';
import constellationÉlectron from './plugins/constellation/électron';

const appli = createApp(App);

appli.use(constellationÉlectron);

appli.mount('#app');

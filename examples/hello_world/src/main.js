import Vue from 'vue'
import App from './App.vue'
import VueBingMaps from 'vue-bing-maps'

Vue.config.productionTip = false

// eslint-disable-next-line no-console
console.log('Calling Vue.use', VueBingMaps);
Vue.use(VueBingMaps, { debug: true });

window.Vue = Vue;

new Vue({
  render: h => h(App),
}).$mount('#app')

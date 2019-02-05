import Promise from 'promise-polyfill'

import Config from './config.js'
import Utils from './utils.js'

import BingConversions from './services/bing-conversions.js'

import ComponentBase from './mixins/component-base.vue'

import MapComponent from './components/bing-map-component.vue'
import LayerComponent from './components/bing-layer-component.vue'
import PushPinComponent from './components/bing-pushpin-component.vue'
import InfoBoxComponent from './components/bing-infobox-component.vue'

if(!window.Promise){
    window.Promise = Promise;
}

export default {
    mixins: {
        componentBase: ComponentBase
    },
    components: {
        map: MapComponent,
        layer: LayerComponent,
        pushpin: PushPinComponent,
        infobox: InfoBoxComponent
    },
    services: {
        conversions: BingConversions
    },
    install(Vue, options){
        if(options){
            Object.assign(Config, options);
        }

        Utils.logger.log('registering bing-map component...');
        Vue.component(MapComponent.name, Vue.extend(MapComponent));

        Utils.logger.log('registering bing-map-layer component...');
        Vue.component(LayerComponent.name, Vue.extend(LayerComponent));

        Utils.logger.log('registering bing-map-pushpin component...');
        Vue.component(PushPinComponent.name, Vue.extend(PushPinComponent));

        Utils.logger.log('registering bing-map-infobox component...');
        Vue.component(InfoBoxComponent.name, Vue.extend(InfoBoxComponent)); 

        Utils.logger.log('bing map vue plugin installed!');       
    }
}
<template>
  <div ref="infoboxContainer">
    <slot />
  </div>
</template>

<script>
    import ComponentBase from '../mixins/component-base.vue';
    import Utils from '../utils.js';
    import BingConversions from '../services/bing-conversions.js'

    const infoboxEvents = Object.freeze([
        'click', 
        'infoboxChanged', 
        'mouseenter', 
        'mouseleave'
    ]);

    export default {
        name: 'BingMapInfobox',
        mixins: [ComponentBase],
        props: {
            options: {
                required: false,
                type: Object,
                default: () => {}
            }
        },
        data(){
            return {
                itemType: 'infobox',
                allowedEvents: infoboxEvents
            };
        },
        inject: ['getMap'],
        watch: {
            options(value){
                let infobox = this.getItem();
                
                if(infobox){
                    let options = this.convertOptions(value || {});

                    infobox.setOptions(options);
                }
            }
        },
        mounted(){
            Utils.logger.log('mounted lifecycle hook, rendering infobox' + this._uid + '...');
            this.render();
        },
        updated(){
            Utils.logger.log('updated lifecycle hook, infobox '+ this._uid + ' updating infobox HTML...');
            this.setCustomHtml();
        },
        beforeDestroy(){
            Utils.logger.log('beforeDestroy lifecycle hook, destroying infobox ' +  this._uid + '...');
            this.destroy();
        },
        methods: {
            hasHtmlTemplate(){
                return !!(this.$slots && this.$slots.default && this.$slots.default.length);
            },
            convertOptions(value){
                let options = (value ? Utils.deepClone(value) : Utils.deepClone(this.options)) || {};

                for(var prop in options){
                    if(options.hasOwnProperty(prop)){
                        switch(prop){
                            case 'location':
                                if(typeof(options.location) === 'object'){
                                    options.location = BingConversions.toMapLocation(options.location);
                                }
                                break;
                            case 'offset':
                                if(typeof(options.offset) === 'object'){
                                    options.offset = BingConversions.toMapPoint(options.offset);
                                }
                                break;
                        }
                    }
                }

                return options;
            },
            setCustomHtml(){
                if(this.hasHtmlTemplate()){
                    let infobox = this.getItem();
                    if(infobox){
                        let template = this.$refs.infoboxContainer.innerHTML;
                        infobox.setHtmlContent(template);
                    }
                }
            },
            render(){
                let map = this.getMap();
                let infobox = this.getItem();

                if(map){
                    if(infobox){
                        this.destroy();
                    }

                    let options = this.convertOptions();
                    let location = options && options.location;

                    if(typeof(location) !== 'object'){
                        location = map.getCenter();
                        options.location = location;
                        options.visible = false;
                    }

                    infobox = this.setItem(new Microsoft.Maps.Infobox(location, options));
                    this.setCustomHtml();
                    infobox.setMap(map);
                } else {
                    Utils.logger.error('infobox render error: map not found!');
                }
            },
            destroy(){
                let infobox = this.getItem();

                try {
                    if(infobox){
                        let map = this.getMap();

                        if(map){
                            infobox.setMap(null);
                        }
                    }
                } finally {
                    this.setItem(null);
                }
            }
        }
    }
</script>
<template>
    <div ref="pinTemplate">
        <slot v-if="initialized" v-bind:metadata="metadata"></slot>
    </div>
</template>

<script>
    const pushpinEvents = Object.freeze([
        'changed', 
        'click', 
        'dblclick', 
        'drag', 
        'dragend', 
        'dragstart', 
        'mousedown', 
        'mouseout', 
        'mouseover', 
        'mouseup'
    ]);

    import ComponentBase from '../mixins/component-base.vue';
    import Utils from '../utils.js';
    import BingConversions from '../services/bing-conversions.js'

    export default {
        name: 'bing-map-pushpin',
        mixins: [ComponentBase],
        props: {
            options: {
                type: Object,
                required: false,
                default: () => {}
            },
            metadata: {
                type: Object,
                required: false,
                default: () => null
            },
            location: {
                type: Object,
                required: true,
                validator: (value) => value && typeof(value.latitude) === 'number' && typeof(value.longitude) === 'number'
            }
        },
        data(){
            return {
                itemType: 'push-pin',
                initialized: true,
                allowedEvents: pushpinEvents
            };
        },
        computed: {
            innerOptions(){
                let source = this.options;
                let target = {};

                for(var prop in source){
                    if(source.hasOwnProperty(prop)){
                        switch(prop){
                            case 'anchor':
                            case 'textOffset':
                                target[prop] = BingConversions.toMapPoint(source[prop]);
                                break;
                            default: 
                                target[prop] = Utils.deepClone(source[prop]);
                                break;
                        }                        
                    }
                }

                return target;
            }
        },
        watch: {
            metadata: {
                deep: true,
                handler(value){
                    let pin = this.getItem();
                    if(pin){
                        pin.metadata = Utils.deepClone(value);
                    }
                }
            },
            location(value){
                let pin = this.getItem();
                if(pin){
                    pin.setLocation(BingConversions.toMapLocation(value));
                }
            },
            innerOptions(value){
                let pin = this.getItem();
                if(pin){
                    pin.setOptions(value);
                }
            }
        },
        inject: ['getLayer'],
        methods: {
            hasIconTemplate(){
                return !!(this.$slots && this.$slots.default && this.$slots.default.length);
            },
            render(){
                let layer = this.getLayer();
                let pin = this.getItem();

                if(layer){
                    if(pin){
                        this.destroy();
                    }

                    let options = Utils.deepClone(this.innerOptions);

                    pin = this.setItem(new Microsoft.Maps.Pushpin(BingConversions.toMapLocation(this.location), options));
                    pin.metadata = Utils.deepClone(this.metadata);

                    this.updateIcon();

                    layer.add(pin);
                } else {
                    Utils.logger.error('push-pin render error: layer not found!');
                }
            },
            updateIcon(){
                if(this.hasIconTemplate()){
                    let pin = this.getItem();
                    if(pin){
                        let template = this.$refs.pinTemplate.innerHTML;
                        pin.setOptions({ icon: template });
                    }
                }
            },
            destroy(){
                let pin = this.getItem();

                try {
                    if(pin){
                        let layer = this.getLayer();

                        if(layer){
                            layer.remove(pin);
                        }
                    }
                } finally {
                    this.setItem(null);
                }
            }
        },
        mounted(){
            Utils.logger.log('mounted lifecycle hook, rendering push-pin' + this._uid + '...');
            this.render();
        },
        beforeUpdate(){
            Utils.logger.log('beforeUpdate lifecycle hook, pin ' + this._uid);
        },
        updated(){
            Utils.logger.log('updated lifecycle hook, pin '+ this._uid + ' updating icon...');
            this.updateIcon();
        },
        beforeDestroy(){
            Utils.logger.log('beforeDestroy lifecycle hook, destroying push-pin ' +  this._uid + '...');
            this.destroy();
        }
    }
</script>
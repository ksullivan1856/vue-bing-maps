<template>
    <div>
        <slot v-if="initialized"></slot>
    </div>
</template>

<script>
    const layerEvents = Object.freeze([
        'click', 
        'dblclick', 
        'mousedown', 
        'mouseover', 
        'mouseout', 
        'mouseup', 
        'rightclick'
    ]);

    import ComponentBase from '../mixins/component-base.vue';
    import Utils from '../utils.js';

    export default {
        name: 'bing-map-layer',
        mixins: [ComponentBase],
        props: {
            name: {
                type: String,
                required: false,
                default() {
                    return 'layer-' + this._uid;
                }
            },
            visible: {
                type: Boolean,
                required: false,
                default: () => true
            },
            zIndex: {
                type: Number,
                required: false,
                default: () => 0
            }
        },
        data(){
            return {
                itemType: 'layer',
                allowedEvents: layerEvents
            };
        },
        watch: {
            visible(value){
                let layer = this.getItem();
                if(layer){
                    layer.setVisible(value);
                }
            },
            zIndex(value){
                let layer = this.getItem();
                if(layer){
                    layer.setZIndex(value);
                }
            }
        },
        inject: ['getMap'],
        provide(){
            return {
                getLayer: this.getItem
            };
        },
        methods: {
            render(){
                let layer = this.getItem();
                let map = this.getMap();

                if(map){
                    if(layer){
                        Utils.logger.log('layer ' + this.name + ' already exists, destroying previous instance...');
                        this.destroy();
                    }
    
                    Utils.logger.log('creating new layer: ' + this.name);
                    layer = this.setItem(new Microsoft.Maps.Layer(this.name));
                    layer.setVisible(this.visible);
                    if(this.zIndex){
                        layer.setZIndex(this.zIndex);
                    }

                    Utils.logger.log('adding layer: ' + this.name + ' to map...');
                    map.layers.insert(layer);
                    this.initialized = true;
                } else {
                    Utils.logger.error('layer render error: map not found!');
                }
            },
            destroy(){
                let layer = this.getItem();

                try {
                    if(layer){
                        let map = this.getMap();
                        
                        if(map){
                            map.layers.remove(layer);
                        }
    
                        if(typeof(layer.dispose) === 'function'){
                            Utils.logger.log('disposing layer ' + this.name + '...');
                            layer.dispose();
                        }
                    }
                } finally {
                    this.setItem(null);
                }
            }
        },
        mounted(){
            Utils.logger.log('mounted lifecycle hook, rendering layer' + this.name + '...');
            this.render();
            this.registerEvents();
        },
        beforeDestroy(){
            Utils.logger.log('beforeDestroy lifecycle hook, destroying layer ' +  this.name + '...');
            this.destroy();
        }
    }
</script>
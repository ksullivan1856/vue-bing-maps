<template>
    <div ref="mapContainer">
        <div style="display: none;">
            <slot v-if="initialized"></slot>
        </div>
    </div>
</template>

<script>
    const mapEvents = Object.freeze([
        'click', 
        'dblclick', 
        'mapresize', 
        'maptypechanged', 
        'mousedown', 
        'mousemove', 
        'mouseout', 
        'mouseover', 
        'mouseup', 
        'mousewheel', 
        'rightclick', 
        'viewchange', 
        'viewchangeend', 
        'viewchangestart'
    ]);

    import ComponentBase from '../mixins/component-base.vue';
    import Config from '../config.js';
    import Utils from '../utils.js';
    import BingConversions from '../services/bing-conversions.js'

    export default {
        name: 'bing-map',
        mixins: [ComponentBase],
        props: {
            credentials: {
                type: String,
                required: true
            },
            options: {
                type: Object,
                required: false,
                default(){
                    return {

                    };
                }
            }
        },
        data(){
            return {
                itemType: 'map',
                rendering: false,
                apiLoaded: false,
                allowedEvents: mapEvents
            };
        },
        computed: {
            mapOptions(){
                if(!this.apiLoaded){
                    return {};
                }

                let source = this.options;
                let target = {};

                for(var prop in source){
                    if(source.hasOwnProperty(prop)){
                        switch(prop){
                            case 'navigationBarOrientation':
                                target[prop] = BingConversions.toNavigationBarOrientation(source[prop]);
                                break;
                            case 'mapTypeId':
                            case 'supportedMapTypes':
                                target[prop] = BingConversions.toMapTypeId(source[prop])
                                break;
                            default:
                                target[prop] = source[prop];
                                break;
                        }
                    }
                }

                return target;
            }
        },
        provide() {
            return {
                getMap: this.getItem,
                loadModule: this.loadModule
            };
        },
        methods: {
            libLoaded() {
                return !!(window.Microsoft && window.Microsoft.Maps && window.Microsoft.Maps.Map);
            },
            getInitCallbackFnName(){
                return 'mapInitializeCallback_' + this._uid;
            },
            getMapApiUrl(){
                var bingMapUrl = Config.bingApiUrl;
                return bingMapUrl.replace('{callback}', this.getInitCallbackFnName()).replace('{credentials}', this.credentials);                
            },
            loadApi() {
                let self = this;
                Utils.logger.log('loading api...');
                return new Promise((resolve, reject) => {
                    if(self.libLoaded()){
                        Utils.logger.log('api already loaded!');
                        self.apiLoaded = true;
                        resolve();
                    } else {
                        Utils.logger.log('setting map init callback');
                        window[self.getInitCallbackFnName()] = function() {
                            Utils.logger.log('map init callback: ', self.getInitCallbackFnName());
                            delete window[self.getInitCallbackFnName()];
                            self.apiLoaded = true;
                            resolve();
                        };

                        Utils.logger.log('adding bing api to document head url: ', self.getMapApiUrl());
                        let tag = document.createElement('script');
                        tag.type = 'text/javascript';
                        tag.src = self.getMapApiUrl();
                        tag.async = true;
                        tag.defer = true;
                        tag.onerror = function(event) {
                            delete window[self.getInitCallbackFnName()];
                            reject(event);                            
                        };

                        document.head.append(tag);
                    }
                });
            },
            loadModule(name){
                let self = this;
                let normalizedName = (name || '').toLowerCase().trim();
                return new Promise((resolve, reject) => {
                    if(!normalizedName){
                        reject('A module name must be specified');
                    } else if(!self.libLoaded()){
                        reject('This function can only be called after the Bing Map library has been loaded');
                    } else {
                        let loadedModules = Utils.loadedModules;
                        if(!loadedModules){
                            loadedModules = [];
                            Utils.loadedModules = loadedModules;
                        }
                        if(loadedModules.item.indexOf(normalizedName) > -1){
                            Utils.logger.log('Map module ' + normalizedName + ' already loaded, resolving...');
                            resolve();
                        } else {
                            Microsoft.Maps.loadModule(name, {
                                callback(){
                                    Utils.logger.log('Map module ' + normalizedName + ' successfully loaded!');
                                    loadedModules.item.push(normalizedName);
                                    resolve();
                                },
                                errorCallback(message){
                                    Utils.logger.warn('Map module ' + normalizedName + ' loading failed!');
                                    reject(message);
                                }
                            })
                        }
                    }
                });                
            },
            draw(){
                this.render();
            },
            render(){
                let self = this;
                return new Promise((resolve, reject) => {
                    self.rendering = this;
                    let map = self.getItem();

                    // if the map already exists, destroy it first so we can re-render
                    // we are doing this when we add a watcher on the mapOptions property
                    // since many of the map options can only be set via the Bing Map Constructor
                    // TODO: add property checking to the mapOptions watcher to only re-render map if
                    //       an option changed that is required in the map constructor
                    if(map){
                        self.destroy();
                    }

                    Promise.all([self.loadApi(), self.$nextTick()]).then(() => {
                        map = self.setItem(new Microsoft.Maps.Map(self.$refs.mapContainer, self.mapOptions));

                        // bing maps will fire the viewchangeend event when the map is first drawn
                        // let's listen for this event to trigger the setting of our initialized property
                        // which will enable the slot and allow any child components to be created and rendered
                        Microsoft.Maps.Events.addOne(map, 'viewchangeend', () => {
                            self.initialized = true;
                        });

                        resolve();
                    }).catch(function(err){
                        reject(err);
                    }).finally(() => {
                        self.rendering = false;
                    });
                });
            },
            destroy(){
                this.initialized = false;
                let map = this.getItem();

                if(map && typeof(map.dispose) === 'function'){
                    map.dispose();
                    this.setItem(null);
                }
            }
        },
        mounted(){
            Utils.logger.log('mounted lifecycle hook, rendering map...');
            this.draw();
        },
        beforeDestroy(){
            Utils.logger.log('beforeDestroy lifecycle hook, destroying map...');
            let self = this;
            self.destroying = true;
            self.unRegisterEvents().then(self.destroy).finally(() => {
                self.destroying = false;
            });
        },
        activated(){
            Utils.logger.log('map activated lifecycle hook, checking criteria for rendering map...');
            if(!this.rendering && !this.getItem()){
                Utils.logger.log('map component activated from deactivated state, rendering map...');
                this.draw();
            } else {
                Utils.logger.log('map component activated from initial mounted stated, no action performed here since already performed in mounted hook');
            }
        },
        deactivated(){
            Utils.logger.log('deactivated lifecyle hook, destroying map...');
            this.unRegisterEvents().then(this.destroy);
        }
    }
</script>
<script>
    import Utils from '../utils.js';

    export default {
        data() {
            return {
                /**
                 * @property __item
                 * @description The Bing Maps entity object, this can be the map, layer, pushpin, etc.  
                 *              It is prefixed with two underscores, since Vue will not proxy a property that is prefixed
                 *              an underscore (_) or a dollar sign ($), we will take advantage of this since proxying this
                 *              type of object will KILL the browser and application.
                 */
                __item: null,
                /**
                 * @property __itemHandlers
                 * @description Used to store the event handler ids for all events registered to the Bing Map entity object
                 */
                __itemHandlers: [],
                itemType: null,
                initialized: false,
                allowedEvents: []
            };
        },
        computed: {

        },
        methods: {
            getItem() {
                return this.__item;
            },
            setItem(item){
                this.__item = item;
                return item;
            },
            getAttachedEventListeners() {
                let listeners = this.$listeners || {};
                let prefix = this.itemType + '-';
                let names = [];
                for(var prop in listeners){
                    if(listeners.hasOwnProperty(prop)){
                        names.push(prop.replace(prefix, ''));
                    }
                }

                return names;
            },
            registerEvents(){
                let self = this;
                let itemType = this.itemType;
                let events = self.getAttachedEventListeners();
                let defaultTransform = function(event){
                    Utils.logger.log(event);
                    return {
                        meta: event.primitive && event.primitive.metadata,
                        x: typeof(event.getX) === 'function' ? event.getX() : null,
                        y: typeof(event.getY) === 'function' ? event.getY() : null,
                        pageX: event.pageX,
                        pageY: event.pageY,
                        point: event.point,
                        location: event.location,
                        targetType: event.targetType
                    };
                };

                if(!self.__itemHandlers){
                    self.__itemHandlers = [];
                }

                return new Promise((resolve, reject) => {
                    let item = self.getItem();
                    var eventHandlers = self.allowedEvents.reduce(function(handlers, currentEvent){
                        var filteredHandlers = events.filter(function(item){
                            return item === currentEvent || (item && item.name === currentEvent);
                        });

                        filteredHandlers.forEach(function(handler){
                            var handlerType = typeof(handler);
                            if(handlerType === 'undefined'){
                                Utils.logger.log('no user-defined ' + itemType + ' event handler for event: ' + currentEvent);
                            } else if(handlerType === 'string'){
                                Utils.logger.log('setting up default handler for ' + itemType + ' event: ' + handler);
                                handlers.push({
                                    name: currentEvent,
                                    transform: defaultTransform,
                                    delay: 0,
                                    once: false
                                });
                            } else if(handlerType === 'object'){
                                handlers.push({
                                    name: currentEvent,
                                    transform: handler.transform,
                                    delay: handler.delay || 0,
                                    once: handler.once || false
                                });
                            } else{
                                Utils.logger.warn('unknown ' + itemType + ' event handler type: ', handler);
                            }

                        });

                        return handlers;
                    }, []);

                    eventHandlers.forEach((eventHandler) => {
                        var eventHandle;
                        var handler = function(e){
                            var args = eventHandler.transform(e);
                            self.$emit(self.itemType + '-' + eventHandler.name, Utils.deepClone(args));
                        };

                        if(eventHandler.once === true){
                            Microsoft.Maps.Events.addOne(item, eventHandler.name, handler);
                        } else if(eventHandler.delay > 0){
                            eventHandle = Microsoft.Maps.Events.addThrottledHandler(item, eventHandler.name, handler, eventHandler.delay);
                        } else {
                            eventHandle = Microsoft.Maps.Events.addHandler(item, eventHandler.name, handler);
                        }
                        
                        if(eventHandle){
                            self.__itemHandlers.push(eventHandle);
                        }
                    });

                    resolve(item);
                });
            },
            unRegisterEvents(){
                let self = this;
                return new Promise((resolve, reject) => {
                    let events = self.__itemHandlers || [];
    
                    while(events.length){
                        var event = events.pop();
                        Microsoft.Maps.Events.removeHandler(event);
                    }

                    resolve();
                });
            }
        }
    }
</script>
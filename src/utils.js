import Config from './config.js'

export default {
    loadedModules: [],
    deepClone: function(item){
        return JSON.parse(JSON.stringify(item));
    },
    logger: {
        log: function(){
            if(Config.debug){
                console.log.apply(null, Array.prototype.slice.call(arguments, 0));
            }
        },
        info: function(){
            if(Config.debug){
                console.info.apply(null, Array.prototype.slice.call(arguments, 0));
            }
        },
        warn: function(){
            if(Config.debug){
                console.warn.apply(null, Array.prototype.slice.call(arguments, 0));
            }
        },
        debug: function(){
            if(Config.debug){
                console.debug.apply(null, Array.prototype.slice.call(arguments, 0));
            }
        },
        error: function(){
            if(Config.debug){
                console.error.apply(null, Array.prototype.slice.call(arguments, 0));
            }
        }      
    }
}
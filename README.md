vue-bing-maps

vue-bing-maps
=========

> A Vue.js Bing Maps v8 Wrapper Library

[![npm version](https://badge.fury.io/js/vue-bing-maps.svg)](https://badge.fury.io/js/vue-bing-maps)

Installation
------------

### Using npm

`npm i --save vue-bing-maps`

Usage
-----

### Bundler (Webpack, Rollup)

```js
import Vue from 'vue'

import VueBingMaps from 'vue-bing-maps'

// Default configuration
Vue.use(VueBingMaps);

// Turn on debug logging
Vue.use(VueBingMaps, { debug: true });
```

### Browser

```html
<!-- Include after Vue -->
<script src="vue-bing-maps/dist/vue-bing-maps-0.0.1.js"></script>
<script>
  Vue.use(VueBingMaps.default);
</script>
```

### Usage example

```html
    <style>
        .customInfobox {
            background-color: rgba(0,0,0,0.5);
            color: white;
            max-width: 200px;
            border-radius: 10px;
            padding: 10px;
            font-size:12px;
            pointer-events:auto !important;
        }
    </style>

<bing-map :credentials="mapCredentials" :options="mapOptions" v-if="mapVisible">
    <bing-map-layer name="activeFlightsLayer" 
                    v-on:layer-click="handleEvent" 
                    v-on:layer-mouseover="showTooltip" 
                    v-on:layer-mouseout="hideTooltip"
                    :visible="pinsVisible">
        <bing-map-pushpin v-for="item in pins" :metadata="item.metadata" :location="item.location" :options="item.options"></bing-map-pushpin>
        <bing-map-infobox :options="tooltip">
            <div class="customInfobox">{{tooltip.description}}</div>
        </bing-map-infobox>
    </bing-map-layer>
</bing-map>
```

License
-------

This project is licensed under [MIT License](http://en.wikipedia.org/wiki/MIT_License)
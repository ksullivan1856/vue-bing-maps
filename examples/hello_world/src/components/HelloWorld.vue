<template>
  <div class="hello">
    <div class="map-example">
      <bing-map credentials="[YOUR_API_KEY]" :options="mapOptions">
        <bing-map-layer name="layer-1" :visible="layerVisible">
          <bing-map-pushpin v-for="item in pins" 
                            :key="item.key"
                            :location="item.location" 
                            :options="item.options">
          </bing-map-pushpin>
        </bing-map-layer>
      </bing-map>
    </div>
    <div>
      <button type="button" @click="toggleLayer">Toggle Layer Visibility</button>
    </div>
  </div>
</template>

<script>


export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data: function(){
    return {
      layerVisible: true,
      mapOptions: {
        zoom: 4
      },
      pins: [
        {
          key: 'pin1',
          location: {
            latitude: 36.922450,
            longitude: -104.829098
          },
          options: {
            title: 'pin 1',
            visible: true
          }
        },
        {
          key: 'pin2',
          location: {
            latitude: 39.950806,
            longitude: -77.770620
          },
          options: {
            title: 'pin 2',
            visible: true
          }
        }
      ]
    };
  },
  methods: {
    toggleLayer() {
      this.layerVisible = !this.layerVisible;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.map-example {
  width: 100%;
  height: 500px;
}
</style>

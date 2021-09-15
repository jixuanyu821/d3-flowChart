<template>
  <div>
    <button type="button" @click="$refs['d3'].newNode({source: {
            x: 600,
            y: 300,
          }},color)">新增节点</button>
    <input type="text" v-model="color">
    <d3 ref="d3" style="height:100vh;" />
    <!-- <z-flow style="height:100vh;"/> -->
  </div>
</template>
<script>
import D3 from './components/d3-5.vue'
export default {
  name: 'App',
  components: {
    D3
  },
  data() {
    return {
      color:''
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
}
</style>

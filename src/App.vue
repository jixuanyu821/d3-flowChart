<template>
  <div>
    <d3 style="height:100vh;"></d3>
    <!-- <z-flow style="height:100vh;"/> -->
  </div>
</template>

<script>
import D3 from './components/d3-5.vue'

export default {
  name: 'App',
  components: {
    D3
  }
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

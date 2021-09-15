import { createApp } from 'vue'
import App from './App.vue'
import ZFlow from './plugins'



const app = createApp(App)
const win = window

if(process.env.NODE_ENV === 'development'){
  if('__VUE_DEVTOOLS_GLOBAL_HOOK__' in win){
    win.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app
  }
}

app.use(ZFlow).mount('#app')

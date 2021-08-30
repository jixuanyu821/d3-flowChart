import ZFLOW from './z-flow/index.js'

const components = [ZFLOW]

const install = function (Vue) {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
export default {
  install,
  ZFLOW
}

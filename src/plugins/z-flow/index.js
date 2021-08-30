/*
 * @Author: jixuanyu
 * @Date: 2021-07-12 09:51:27
 * @LastEditors: jixuanyu
 * @Description: file content
 */
import ZFLOW from './flow.vue'

ZFLOW.install = function (Vue) {
  Vue.component(ZFLOW.name, ZFLOW)
}

export default ZFLOW


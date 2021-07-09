<!--
 * @Author: jixuanyu
 * @Date: 2021-07-06 16:39:40
 * @LastEditors: jixuanyu
 * @Description: file content
-->
<template>
  <div class="svgContent">
    <div @click="showSvg">显隐svg</div>
    <svg
      draggable
      id="svg"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g class="outG">
        <template v-if="showFlag">
          <nodeG
            :node="node"
            @nodeChange="nodeChange"
            v-for="node in treeData"
            :key="node.id"
          ></nodeG>
        </template>
      </g>
    </svg>
  </div>
</template>
<script>
import nodeG from './nodeG.vue'
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom'
import { select, event } from 'd3-selection'
let svg
export default {
  components: {
    nodeG,
  },
  data() {
    return {
      showFlag: true,
      treeData: [
        {
          name: '节点1',
          id: 1,
          source: {
            x: 100,
            y: 50,
          },
          circle:[
            {
              x: 272,
              y: 80,
            }
          ],
          link:[
            {
              x: 396,
              y: 40,
            },{
              x: 396,
              y: 230,
            }
          ],
          children: [
            {
              name: '节点2',
              id: 2,
              source: {
                x: 400,
                y: 10,
              },
              children: [
                {
                  name: '节点4',
                  id: 4,
                  source: {
                    x: 600,
                    y: 30,
                  },
                },
                {
                  name: '节点5',
                  id: 5,
                  source: {
                    x: 600,
                    y: 200,
                  },
                },
              ],
            },
            {
              name: '节点3',
              id: 3,
              source: {
                x: 400,
                y: 200,
              },
            },
          ],
        },
      ],
    }
  },
  mounted() {
    svg = select('#svg')
    this.initSvg()
  },
  methods: {
    showSvg() {
      this.showFlag = !this.showFlag
    },
    initSvg() {
      // eslint-disable-next-line no-unused-vars
      const outG = svg.select('.outG')
      outG.attr('transform', zoomIdentity)
      const zoom = d3Zoom()
        .scaleExtent([0.5, 1.5])
        .on('zoom', function() {
          outG.attr('transform', event.transform)
        })
      select('#svg')
        .call(zoom)
        .on('dblclick.zoom', null)
    },
    nodeChange({ id, source,d }) {
      console.log(id, source, 'nodeChange')
      this.treeData = this.setTreeData(this.treeData,id,source,d.dx,d.dy)
      // vue.$set(this.treeData, index, arr[index])
    },
    setTreeData(arr, id, source,dx,dy) {
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i]
        if (String(id) === String(item.id)) {
          item.source = source
          item.circle = item.circle.map(ele=>({x: ele.x + dx,y:ele.y+dy}))
          item.link = item.link.map(ele=>({x: ele.x + dx,y:ele.y+dy}))
          break
        }
        if (item.children && item.children.length > 0) {
          item.children  =this.setTreeData(item.children, id, source)
        }
      }
      return arr
    },
  },
}
</script>

<style>
.svgContent {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.nodeG {
  cursor: pointer;
}
#svg:hover {
  cursor: grab;
}
#svg:active {
  cursor: grabbing;
}
.nodeG .rectborder {
  display: none;
}
</style>

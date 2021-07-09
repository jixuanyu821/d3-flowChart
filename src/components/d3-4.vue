<!--
 * @Author: jixuanyu
 * @Date: 2021-07-06 16:39:40
 * @LastEditors: jixuanyu
 * @Description: file content
-->
<template>
  <div class="svgContent">
    <div @click="newNode()">新建节点</div>
    <div class="main">
      <svg
        draggable
        id="svg"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g class="outG">
          <nodeG
            :node="node"
            @nodeChange="nodeChange"
            @circleChange="circleChange"
            @targetCircleChange="targetCircleChange"
            v-for="node in treeData"
            :key="node.id"
          ></nodeG>
        </g>

        <defs>
          <marker
            id="Triangle"
            viewBox="0 0 20 20"
            refX="0"
            refY="5"
            markerWidth="10"
            markerHeight="10"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" stroke="#ddd" fill="#ddd" />
          </marker>
        </defs>
        <polyline
          points="10,90 90,20"
          fill="none"
          stroke="#ddd"
          stroke-dasharray="20,10,5,5,5,10"
          stroke-width="2"
          marker-end="url(#Triangle)"
        />
      </svg>
      <div class="outerContanier">
        <div
          class="opreate_node"
          :style="`left: ${node.source.x}px; top: ${node.source.y}px;`"
          v-for="node in treeData"
          :key="node.id"
        >
          <button @click="linkTarget(node)">连线</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import nodeG from './nodeG-2.vue'
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom'
import { select, event } from 'd3-selection'
const [width, height] = [168, 60]
let svg
export default {
  components: {
    nodeG,
  },
  data() {
    return {
      index: 6,
      treeData: [
        {
          name: '节点1',
          id: 1,
          source: {
            x: 100,
            y: 50,
          },
          link: [
            {
              targetId: 2,
              source: {
                x: 272,
                y: 80,
              },
              target: {
                x: 396,
                y: 40,
              },
            },
            {
              targetId: 3,
              source: {
                x: 272,
                y: 80,
              },
              target: {
                x: 396,
                y: 230,
              },
            },
          ],
        },
        {
          name: '节点2',
          id: 2,
          source: {
            x: 400,
            y: 10,
          },
          link: [
            {
              targetId: 4,
              source: {
                x: 572,
                y: 40,
              },
              target: {
                x: 596,
                y: 60,
              },
            },
            {
              targetId: 5,
              source: {
                x: 572,
                y: 40,
              },
              target: {
                x: 596,
                y: 230,
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
    }
  },
  mounted() {
    svg = select('#svg')
    this.initSvg()
  },
  methods: {
    newNode() {
      this.treeData.push({
        name: '节点' + this.index,
        id: this.index,
        source: {
          x: 700,
          y: 200,
        },
      })
      this.index++
    },
    // 初始化svg 添加整体的缩放和拖拽
    initSvg() {
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
    /**
     * @description: 节点拖拽后触发 变更数据内的点位数据 重新渲染
     * @param {*} id // 拖拽的节点id
     * @param {*} source // 拖拽后节点的点位
     * @param {*} d {dx,dy} 鼠标拖拽过程中的偏移量
     */    
    nodeChange({ id, source, d }) {
      this.treeData = this.setTreeData(this.treeData, id, source, d.dx, d.dy)
    },
    circleChange({ id, index, d }) {
      this.treeData = this.setCircleData(this.treeData, id, index, d.x, d.y)
    },
    /**
     * @description: 
     * @param {*} id 拖拽的目标id 对应的是 treedata 内link 的targetid 
     * @param {*} d 鼠标当前点位
     */    
    targetCircleChange({ id, d }) {
      this.treeData = this.settargetCircleData(this.treeData, id, d.x, d.y)
    },
    /**
     * @description:  根据新的点位重新生成数据
     * @param {*} arr // 数据
     * @param {*} id // 节点Id
     * @param {*} source // 目标点味
     * @param {*} dx // 偏移量y
     * @param {*} dy // 偏移量y
     */    
    setTreeData(arr, id, source, dx, dy) {
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i]
        if (String(id) === String(item.id)) {
          item.source = source
          arr = this.settargetLink(arr, id, dx, dy)
          break
        }
      }
      return arr
    },
    /**
     * @description:  设置目标连线的坐标
     * @param {*} arr 数据
     * @param {*} targetId 目标连线
     * @param {*} dx 偏移量
     * @param {*} dy 偏移量
     */    
    settargetLink(arr, targetId, dx, dy) {
      for (let i = 0; i < arr.length; i++) {
        let ele = arr[i]
        if (ele.link) {
          if (String(ele.id) === String(targetId)) {
            // 找到对应的节点 把节点所有的连线的坐标都加上偏移量
            ele.link = ele.link.map((item) => {
              item.source.x += dx
              item.source.y += dy
              return item
            })
            break
          }
        }
      }
      for (let i = 0; i < arr.length; i++) {
        let ele = arr[i]
        if (ele.link) {
          for (let j = 0; j < ele.link.length; j++) {
            let targetLink = ele.link[j]
            if (String(targetLink.targetId) === String(targetId)) {
              // 找到对应的节点 把节点连线的坐标都加上偏移量
              targetLink.target.x += dx
              targetLink.target.y += dy
              break
            }
          }
        }
      }
      return arr
    },
    setCircleData(arr, targetId, targetIndex, x, y) {
      targetIndex = Number(targetIndex)
      for (let i = 0; i < arr.length; i++) {
        let ele = arr[i]
        if (String(ele.id) === String(targetId)) {
          let [originX, originY] = [ele.source.x, ele.source.y] // 节点原始点位
          let { sourceX, sourceY } = this.handleCircle(originX, originY, x, y)
          if (ele.link && ele.link.length > 0) {
            ele.link[targetIndex].source = {
              x: sourceX,
              y: sourceY,
            }
          }
        }
      }
      return arr
    },
    settargetCircleData(arr, targetId, x, y) {
      let [originX, originY] = [0, 0]
      for (let i = 0; i < arr.length; i++) {
        let ele = arr[i]
        if (String(ele.id) === String(targetId)) {
          //根据id 找对应节点
          [originX, originY] = [ele.source.x, ele.source.y] // 节点原始点位
          break
        }
      }
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].link && arr[i].link.length > 0) {
          for (let j = 0; j < arr[i].link.length; j++) {
            let targetLink = arr[i].link[j]
            if (String(targetLink.targetId) === String(targetId)) {
              console.log(targetLink)
              // 节点原始点位
              let { sourceX, sourceY } = this.handleCircle(
                originX,
                originY,
                x,
                y
              )
              targetLink.target.x = sourceX
              targetLink.target.y = sourceY
              break
            }
          }
        }
      }
      return arr
    },
    handleCircle(originX, originY, x, y) {
      // 处理目标节点
      // 找到对应的目标节点
      // let [originX, originY] = [ele.source.x, ele.source.y] // 节点原始点位
      let [targetX, targetY] = [x, y] // 鼠标当前位置
      let [minX, minY] = [originX - 4, originY - 4] // 点位活动最小范围
      let [maxX, maxY] = [originX + width + 4, originY + height + 4] // 点位活动最大范围
      let [sourceX, sourceY] = [0, 0] // 节点最后确定的位置
      if (targetY > maxY) {
        // 鼠标在Y轴超出最大限制区域
        sourceY = maxY
        // 且鼠标已经超出范围了
        if (targetX > maxX) {
          // 点位始终在右下角
          sourceX = maxX
        } else if (targetX > minX) {
          // 点位在横向可以滚动
          sourceX = targetX
        } else {
          // 点位始终在左下角
          sourceX = minX
        }
      } else if (targetY > minY) {
        // 鼠标Y轴在范围区域内
        if (targetX > maxX) {
          // x轴超出最大范围 x轴固定 Y轴随意移动
          sourceX = maxX
          sourceY = targetY
        } else if (targetX < minX) {
          // x轴超出最x小范围 x轴固定 Y轴随意移动
          sourceX = minX
          sourceY = targetY
        } else {
          // 鼠标在节点中 判断当前鼠标离那条边框较近
          let axisX = Math.min(
            Math.abs(targetY - minY),
            Math.abs(targetY - maxY)
          ) // 取上下边框距离较近的那个
          let axisY = Math.min(
            Math.abs(targetX - minX),
            Math.abs(targetX - maxX)
          ) // 取左右边框距离较近的那个
          if (axisX > axisY) {
            // 离上下边框较近
            sourceX = targetX // x轴跟随鼠标移动
            if (Math.abs(targetY - minY) > Math.abs(targetY - maxY)) {
              // 离下边框较近 y轴固定在下边框
              sourceY = maxY
            } else {
              // 离上边框较近 y轴固定在上边框
              sourceY = minY
            }
          } else {
            // 离左右边框较近
            sourceY = targetY // y轴跟随鼠标移动
            if (Math.abs(targetX - minX) > Math.abs(targetX - maxX)) {
              // 离下边框较近 y轴固定在下边框
              sourceX = maxX
            } else {
              // 离上边框较近 y轴固定在上边框
              sourceX = minX
            }
          }
        }
      } else {
        // 鼠标Y轴超出最小限制区域
        sourceY = minY
        // 且鼠标已经超出范围了
        if (targetX > maxX) {
          // 点位始终在右下角
          sourceX = maxX
        } else if (targetX > minX) {
          // 点位在横向可以滚动
          sourceX = targetX
        } else {
          // 点位在横向可以
          sourceX = minX
        }
      }
      return { sourceX, sourceY }
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
.main {
  width: 90vw;
  height: 90vh;
  position: relative;
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
.opreateContanier {
  position: absolute;
  width: 0;
  height: 0;
  left: 0;
  top: 0;
}
.opreate_node {
  position: absolute;
}
</style>

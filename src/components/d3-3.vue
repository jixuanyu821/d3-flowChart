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
            @circleChange="circleChange"
            v-for="node in treeData"
            :key="node.id"
          ></nodeG>
        </template>
      </g>
    </svg>
  </div>
</template>
<script>
import nodeG from './nodeG-1.vue'
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom'
import { select, event } from 'd3-selection'
const [width, height] = [168, 60, 20]
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
          circle: [
            {
              x: 272,
              y: 80,
            },
          ],
          link: {
            source: {
              x: 272,
              y: 80,
            },
            target: [
              {
                id: 2,
                x: 396,
                y: 40,
              },
              {
                id: 3,
                x: 400,
                y: 230,
              },
            ],
          },
        },
        {
          name: '节点2',
          id: 2,
          source: {
            x: 400,
            y: 10,
          },
          circle: [
            {
              x: 396,
              y: 40,
            },
            {
              x: 572,
              y: 40,
            },
          ],
          link: {
            source: {
              x: 572,
              y: 40,
            },
            target: [
              {
                id: 4,
                x: 596,
                y: 60,
              },
              {
                id: 5,
                x: 596,
                y: 230,
              },
            ],
          },
        },
        {
          name: '节点3',
          id: 3,
          source: {
            x: 400,
            y: 200,
          },
          circle: [
            {
              x: 396,
              y: 230,
            },
          ],
        },
        {
          name: '节点4',
          id: 4,
          source: {
            x: 600,
            y: 30,
          },
          circle: [
            {
              x: 596,
              y: 60,
            },
          ],
        },
        {
          name: '节点5',
          id: 5,
          source: {
            x: 600,
            y: 200,
          },
          circle: [
            {
              x: 596,
              y: 230,
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
    nodeChange({ id, source, d }) {
      console.log(id, source, 'nodeChange')
      this.treeData = this.setTreeData(this.treeData, id, source, d.dx, d.dy)
      // vue.$set(this.treeData, index, arr[index])
    },
    circleChange({ id, index, d }) {
      console.log(id, index, 'circleChange')
      this.treeData = this.setCircleData(this.treeData, id, index, d.x, d.y)
      // vue.$set(this.treeData, index, arr[index])
    },
    setTreeData(arr, id, source, dx, dy) {
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i]
        if (String(id) === String(item.id)) {
          item.source = source
          item.circle = item.circle?.map((ele) => ({
            x: ele.x + dx,
            y: ele.y + dy,
          }))
          this.settargetLink(id, dx, dy)
          break
        }
      }
      return arr
    },
    settargetLink(targetId, dx, dy) {
      // 设置目标连线的坐标
      for (let i = 0; i < this.treeData.length; i++) {
        let ele = this.treeData[i]
        if (ele.link) {
          if (String(ele.id) === String(targetId)) {
            ele.link.source.x += dx
            ele.link.source.y += dy
          }
          if (ele.link.target && ele.link.target.length > 0) {
            let links = ele.link.target
            for (let j = 0; j < links.length; j++) {
              // 找到对应目标连线
              let target = links[j]
              if (String(target.id) === String(targetId)) {
                // 拼接偏移量
                target.x += dx
                target.y += dy
              }
            }
          }
        }
      }
    },
    setCircleData(arr, targetId, targetIndex, x, y) {
      targetIndex = Number(targetIndex)
      for (let i = 0; i < arr.length; i++) {
        let ele = arr[i]
        if (ele.circle) {
          if (String(ele.id) === String(targetId)) {
            // 找到对应的目标节点
            // let targetCircle = ele.circle[targetIndex] // 对应的圆点的
            let [originX, originY] = [ele.source.x, ele.source.y] // 节点原始点位
            // let [circleX, circleY] = [targetCircle.x, targetCircle.y] // 远点原始点位
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
            ele.circle[targetIndex] = {
              x: sourceX,
              y: sourceY,
            }
            if (ele.link) {
              ele.link.source = {
                x: sourceX,
                y: sourceY,
              }
            }
          }
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

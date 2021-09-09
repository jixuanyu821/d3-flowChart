<!--
 * @Author: jixuanyu
 * @Date: 2021-07-06 16:39:40
 * @LastEditors: jixuanyu
 * @Description: file content
-->
<template>
  <div class="svgContent">
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
            ref="nodeG"
            :node="node"
            @nodeChange="nodeChange"
            @circleChange="circleChange"
            @targetCircleChange="targetCircleChange"
            @mouseClickTarget="mouseClickTarget"
            v-for="node in treeData"
            :key="node.id"
          ></nodeG>
        </template>
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
          <path d="M 0 0 L 10 5 L 0 10 z" stroke="#666" fill="#666" />
        </marker>
      </defs>
      <template v-if="showLinkLine">
        <polyline
          :points="
            `${linkLine.source.x},${linkLine.source.y} ${linkLine.target.x},${linkLine.target.y}`
          "
          fill="none"
          stroke="#666"
          stroke-dasharray="20,10,5,5,5,10"
          stroke-width="2"
          marker-end="url(#Triangle)"
        />
      </template>
    </svg>
    <div class="outerContanier">
      <template v-for="node in treeData" :key="node.id">
        <div
          class="opreate_node"
          v-if="node.showOperate"
          :style="
            `left: ${node.source.x + width + border / 2}px; top: ${node.source.y - border / 2}px;`
          "
        >
          <img
            @click="linkTarget(node)"
            class="linkBtn"
            src="~@/assets/Line.svg"
          />
          <img
            @click="deleteNode(node)"
            class="deleteBtn"
            src="~@/assets/delete.svg"
          />
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import nodeG from './nodeG.vue'
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom'
import { select, event } from 'd3-selection'
const [width, height, border] = [168, 60, 20]
let svg, outG
export default {
  name: 'ZFlow',
  components: {
    nodeG,
  },
  data() {
    return {
      index: 6,
      width,
      height,
      border,
      showFlag: true,
      showLinkLine: false,
      linkLine: {
        id: 0,
        source: {
          x: 0,
          y: 0,
        },
        target: {
          x: 0,
          y: 0,
        },
      },
      treeData: [
        {
          name: '节点1',
          id: 1,
          showOperate: false,
          borderColor:'#2080f7',
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
          showOperate: false,
          borderColor:'#DDD',
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
          showOperate: false,
          borderColor:'#DDD',
          id: 3,
          source: {
            x: 400,
            y: 200,
          },
        },
        {
          name: '节点4',
          showOperate: false,
          borderColor:'#DDD',
          id: 4,
          source: {
            x: 600,
            y: 30,
          },
        },
        {
          name: '节点5',
          showOperate: false,
          borderColor:'#DDD',
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
    newNode(source={
          x: 700,
          y: 200,
        },borderColor="#999") {
      this.treeData.push({
        name: '节点' + this.index,
        id: this.index,
        source,
        borderColor
      })
      this.index++
    },
    /**
     * @description: 删除节点
     * @param {*} node 节点
     */

    deleteNode(node) {
      const index = this.treeData.findIndex(
        (item) => String(item.id) === String(node.id)
      )
      this.treeData.splice(index, 1)
      this.treeData.forEach(ele =>{
        const linkIndex = ele.link?.findIndex(item => String(item.targetId) === String(node.id))
        if(linkIndex > -1) ele.link.splice(linkIndex, 1)
      })
    },
    // 初始化svg 添加整体的缩放和拖拽
    initSvg() {
      outG = svg.select('.outG')
      const outerContanier = select('.outerContanier')
      outG.attr('transform', zoomIdentity)
      outerContanier.attr('style', 'transform:' + zoomIdentity)
      const zoom = d3Zoom()
        .scaleExtent([0.5, 1.5])
        .on('zoom', function() {
          outG.attr('transform', event.transform)
          outerContanier.attr(
            'style',
            `transform: translate(${event.transform.x}px,${event.transform.y}px) scale(${event.transform.k})`
          )
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
    /**
     * @description:
     * @param {*} id 拖拽node id
     * @param {*} index // 当前拖拽的节点索引
     * @param {*} d 鼠标当前位置
     */

    circleChange({ id, index, d }) {
      this.treeData = this.setCircleData(this.treeData, id, index, d.x, d.y)
    },
    /**
     * @description:
     * @param {*} id 拖拽的目标id 对应的是 treedata 内link 的targetid
     * @param {*} d 鼠标当前点位
     * @param {*} index 拖拽节点的索引
     */
    targetCircleChange({ id, d, parentId }) {
      this.treeData = this.settargetCircleData(
        this.treeData,
        id,
        d.x,
        d.y,
        parentId
      )
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
    /**
     * @description: 拖拽流程节点连线开始端圆环节点
     * @param {*} arr // 数据
     * @param {*} targetId 目标节点id
     * @param {*} targetIndex 索引
     * @param {*} x 鼠标点位x
     * @param {*} y 鼠标点位y
     * @return {*}  处理后的数据
     */

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
    /**
     * @description: 拖拽流程节点连线结束端圆环节点
     * @param {*} arr // 原始数据
     * @param {*} targetId 节点Id
     * @param {*} x // 鼠标x
     * @param {*} y // 鼠标y
     * @return {*} 处理后的数据
     */
    settargetCircleData(arr, targetId, x, y, parentId) {
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
        if (String(arr[i].id) === String(parentId)) {
          if (arr[i].link && arr[i].link.length > 0) {
            for (let j = 0; j < arr[i].link.length; j++) {
              let targetLink = arr[i].link[j]
              if (String(targetLink.targetId) === String(targetId)) {
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
      }
      return arr
    },
    /**
     * @description:  通过对比节点点位和鼠标当前位置 确定圆环应该附着的节点坐标 圆环应该环绕节点边框做运动
     * @param {*} originX 节点原始点位x 左上角坐标
     * @param {*} originY 节点原始点位y 左上角坐标
     * @param {*} x // 鼠标x
     * @param {*} y // 鼠标y
     * @return { sourceX, sourceY }
     */
    handleCircle(originX, originY, x, y) {
      // 处理目标节点
      // 找到对应的目标节点
      // let [originX, originY] = [ele.source.x, ele.source.y] // 节点原始点位
      let [targetX, targetY] = [x, y] // 鼠标当前位置
      let [minX, minY] = [originX - 4, originY - 4] // 点位活动最小范围
      let [maxX, maxY] = [originX + width + 4, originY + height + 4] // 点位活动最大范围
      let [sourceX, sourceY] = [0, 0] // 节点最后确定的位置
      if (targetY > maxY) {
        // 鼠标在Y轴超出最大限制区域 此时y轴永远处于最大值 不可增加
        sourceY = maxY
        // 且鼠标已经超出范围了
        if (targetX > maxX) {
          // 点位始终在右下角
          sourceX = maxX
        } else if (targetX > minX) {
          // x轴在节点横向范围内
          // 点位在横向可以滚动
          sourceX = targetX
        } else {
          // x轴超出最小范围
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
          // 取上下边框距离较近的那个
          let axisX = Math.min(
            Math.abs(targetY - minY),
            Math.abs(targetY - maxY)
          )
          // 取左右边框距离较近的那个
          let axisY = Math.min(
            Math.abs(targetX - minX),
            Math.abs(targetX - maxX)
          )
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
    /**
     * @description:
     * @param {*} id
     * @param {*} x
     * @param {*} y
     */
    mouseClickTarget({ id, originX, originY }) {
      this.treeData.forEach((element) => {
        element.showOperate = false
      })
      let index = this.treeData.findIndex(
        (item) => String(item.id) === String(id)
      )
      this.treeData[index].showOperate = true
      if (this.showLinkLine) {
        this.showLinkLine = false
        svg.on('mousemove', null) // 解绑鼠标移动事件
        let { x, y } = this.linkLine.target // 根据鼠标结束位置计算连线结束的定位
        let { sourceX, sourceY } = this.handleCircle(originX, originY, x, y)
        for (let i = 0; i < this.treeData.length; i++) {
          if (this.treeData[i].id === this.linkLine.id) {
            // 找到连线的起始节点
            let item = this.treeData[i]
            let link = {
              targetId: id,
              source: this.linkLine.source,
              target: {
                x: sourceX,
                y: sourceY,
              },
            }
            if (item.link && item.link.length > 0) {
              let index = item.link.findIndex(
                (e) => String(e.targetId) === String(id)
              )
              if (index === -1) {
                item.link.push(link)
              }
            } else {
              item['link'] = [link]
            }
          }
        }
      }
      this.$refs.nodeG.reload()
    },
    /**
     * @description:
     * @param {node} 要连线的节点
     */

    linkTarget(node) {
      this.showLinkLine = true
      let [sourceX, sourceY] = [node.source.x, node.source.y]
      this.linkLine.id = node.id
      this.linkLine.source = {
        x: sourceX + width / 2,
        y: sourceY + height,
      }
      this.linkTargetStart()
    },
    linkTargetStart() {
      let _this = this
      svg.on('mousemove', function() {
        let { x, y } = event
        let pageX = document.querySelector('.main').offsetLeft
        let pageY = document.querySelector('.main').offsetTop
        _this.linkLine.target = { x: Number(x) - pageX, y: Number(y) - pageY }
      })
    },
  },
}
</script>

<style scoped>
.svgContent {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #e4e4e4;
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
.outerContanier {
  position: absolute;
  width: 0;
  height: 0;
  left: 0;
  top: 0;
}
.opreate_node {
  position: absolute;
  background-color: #fff;
  border: 1px solid #e4e4e4;
}
.opreate_node{
  position: absolute;
}
.linkBtn,
.deleteBtn {
  /* background: #fff url('../assets/Line.svg') 100% 100%; */
  width: 28px;
  height: 28px;
  cursor: pointer;
}
</style>

<!--
 * @Author: jixuanyu
 * @Date: 2021-07-06 17:08:39
 * @LastEditors: jixuanyu
 * @Description: file content
-->
<template>
  <g
    class="nodeG"
    :key="node.id"
    :node-id="node.id"
    :sourceX="node.source.x"
    :sourceY="node.source.y"
  >
    <rect
      :x="node.source.x"
      :y="node.source.y"
      fill="#fff"
      :width="width"
      :height="height"
      :stroke="node.borderColor"
      stroke-width="#999"
      class="rect"
      rx="4"
      ry="4"
    ></rect>
    <rect
      :x="node.source.x - border / 2"
      :y="node.source.y - border / 2"
      :width="width + border"
      :height="height + border"
      fill="none"
      stroke="#999"
      stroke-width="#999"
      stroke-dasharray="20,10,5,5,5,10"
      class="rectborder"
      style="display:none"
      rx="4"
      ry="4"
    ></rect>
    <text
      class="text"
      fill="#4c4c4c"
      font-size="12"
      text-align="center"
      dominant-baseline="middle"
      text-anchor="middle"
      :x="node.source.x + width / 2"
      :y="node.source.y + height / 2"
    >
      {{ node.name }}
    </text>
    <template v-if="node.link && node.link && node.link.length > 0">
      <g class="linkContent">
        <path
          fill="none"
          stroke="#333"
          stroke-width="2"
          v-for="child in node.link"
          :d="getLinks(child)"
          :key="child.id"
        ></path>
        <circle
          stroke="#333"
          fill="#fff"
          class="circle"
          node-type="source"
          v-for="(child, index) in node.link"
          :key="index"
          :node-id="node.id"
          :node-index="index"
          r="4"
          :cx="child.source.x"
          :cy="child.source.y"
        ></circle>
        <circle
          stroke="#333"
          fill="#fff"
          class="circle"
          node-type="target"
          v-for="(child, index) in node.link"
          :key="index"
          :node-parent="node.id"
          :node-id="child.targetId"
          :node-index="index"
          r="4"
          :cx="child.target.x"
          :cy="child.target.y"
        ></circle>
      </g>
    </template>
  </g>
</template>
<script>
import { select, selectAll, event } from 'd3-selection'
import { linkHorizontal } from 'd3'
const [width, height, border] = [168, 60, 20]
import { drag } from 'd3-drag'
export default {
  name: 'nodeG',
  props: {
    node: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      border: border,
      width: width,
      height: height,
    }
  },
  mounted() {
    this.bindMouseOver() // 绑定鼠标移入事件
    this.bindDrag() // 绑定节点的拖拽事件
    this.bindCricleDrag() // 绑定
  },
  methods: {
    reload() {
      this.bindMouseOver() // 绑定鼠标移入事件
      this.bindDrag() // 绑定节点的拖拽事件
      this.bindCricleDrag() // 绑定
    },
    getcircleX(x, flag) {
      if (flag) {
        return x - 4
      } else {
        return x + width + 4
      }
    },
    getcircleY(y, flag) {
      if (flag) {
        return y + height / 2
      } else {
        return y + height / 2
      }
    },
    getLinks(child) {
      var link = linkHorizontal() //设置曲线类型
        .x((d) => d.x)
        .y((d) => d.y)
      const startAxis = {
        x: child.source.x,
        y: child.source.y,
      }
      const endAxis = {
        x: child.target.x,
        y: child.target.y,
      }
      return link({ source: startAxis, target: endAxis })
    },
    bindMouseOver() {
      const _this = this
      selectAll('.nodeG')
        .on('mouseover', function() {
          event.stopPropagation()
          const targetDom = select(this)
          targetDom.select('.rect').attr('stroke', '#2080f7')
        })
        .on('mouseout', function() {
          event.stopPropagation()
          const targetDom = select(this)
          targetDom.select('.rect').attr('stroke', '#999')
        })
        .on(
          'click',
          function() {
            event.stopPropagation()
            selectAll('.rectborder').attr('style', 'display:none')
            const targetDom = select(this)
            targetDom.select('.rectborder').attr('style', '')
            targetDom.select('.rect').attr('style', '')
            let [id, originX, originY] = [
              targetDom.attr('node-id'),
              targetDom.attr('sourceX'),
              targetDom.attr('sourceY'),
            ]
            _this.$emit('mouseClickTarget', { id, originX, originY })
          },
          false
        )
      selectAll('.linkContent').on('click', function() {
        event.stopPropagation()
      },false)
    },
    bindDrag() {
      let _this = this
      const dragenvent = drag()
        .on('start', function() {
          // event.stopPropagation()
        })
        .on('end', function() {})
        .on('drag', function() {
          const targetDom = select(this)
          const { dx, dy } = event
          const sourceX = Number(targetDom.attr('sourceX'))
          const sourceY = Number(targetDom.attr('sourceY'))
          // 计算偏移距离重新赋值给source
          const [X, Y] = [sourceX + dx, sourceY + dy]
          const targetId = targetDom.attr('node-id')
          _this.$emit('nodeChange', {
            id: targetId,
            source: { x: X, y: Y },
            d: { dx, dy },
          })
        })
      selectAll('.nodeG').call(dragenvent)
    },
    bindCricleDrag() {
      let _this = this
      const dragenvent = drag()
        .on('start', function() {
          // event.stopPropagation()
        })
        .on('end', function() {
          selectAll('.activeCircle')
            .attr('stroke', '#333')
            .on('.drag', null)
            .classed('activeCircle', false)
        })
        .on('drag', function() {
          const targetDom = select(this)
          const { x, y } = event
          // 计算偏移距离重新赋值给source
          const targetId = targetDom.attr('node-id')
          const targetIndex = targetDom.attr('node-index')
          const targetType = targetDom.attr('node-type')
          if (targetType === 'target') {
            const parentId = targetDom.attr('node-parent')
            _this.$emit('targetCircleChange', {
              id: targetId,
              d: { x, y },
              parentId,
            })
          } else {
            _this.$emit('circleChange', {
              id: targetId,
              index: targetIndex,
              d: { x, y },
            })
          }
        })

      selectAll('.circle').on('click', function() {
        event.stopPropagation()
        select(this)
          .classed('activeCircle', true)
          .attr('stroke', '#2080f7')
        selectAll('.circle').call(dragenvent)
      })
    },
  },
}
</script>

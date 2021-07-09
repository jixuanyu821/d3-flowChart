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
    :flag="isChild"
  >
    <rect
      :x="node.source.x"
      :y="node.source.y"
      fill="#fff"
      :width="width"
      :height="height"
      stroke="#999"
      stroke-width="#999"
      class="rect"
      rx="10"
      ry="10"
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
    <template v-if="node.children && node.children.length > 0">
      <g class="linkContent">
        <path
          fill="none"
          stroke="#333"
          stroke-width="2"
          v-for="child in node.children"
          :data-link="`${node.id}-${child.id}`"
          :d="getLinks(child)"
          :key="child.id"
        ></path>
      </g>
    </template>
    <circle
      stroke="#333"
      fill="#fff"
      class="circle"
      r="4"
      :cx="getcircleX(node.source.x, isChild)"
      :cy="getcircleY(node.source.y, isChild)"
    ></circle>
    <template v-if="node.children && node.children.length > 0">
      <circle
        stroke="#333"
        fill="#fff"
        class="circle"
        r="4"
        :cx="getcircleX(node.source.x, isChild)"
        :cy="getcircleY(node.source.y, isChild)"
      ></circle>
      <nodeG
        class="childnode"
        :parent-id="node.id"
        v-for="child in node.children"
        :node="child"
        :isChild="true"
        :key="child.id"
      ></nodeG>
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
    parentNode: {
      type: Object,
      default() {
        return {}
      },
    },
    isChild: {
      type: Boolean,
      default: false,
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
    this.bindMouseOver()
    this.bindDrag()
  },
  methods: {
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
        x: this.node.source.x + width + 8,
        y: this.node.source.y + height / 2,
      }
      const endAxis = {
        x: child.source.x - 8,
        y: child.source.y + height / 2,
      }
      return link({ source: startAxis, target: endAxis })
    },
    bindMouseOver() {
      selectAll('.nodeG')
        .on('mouseover', function() {
          event.stopPropagation()
          select(this)
            .select('.rect')
            .attr('stroke', '#2080f7')
        })
        .on('mouseout', function() {
          event.stopPropagation()
          select(this)
            .select('.rect')
            .attr('stroke', '#999')
        })
        .on('click', function() {
          event.stopPropagation()
          selectAll('.rectborder').attr('style', 'display:none')
          select(this)
            .select('.rectborder')
            .attr('style', '')
        })
    },
    bindDrag() {
      let _this = this
      const dragenvent = drag()
        .on('start', () => {
          event.stopPropagation()
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
          _this.$emit('nodeChange', { id: targetId, source: { x: X, y: Y }, d:{dx,dy} })
        })
      selectAll('.nodeG').call(dragenvent)
    },
  },
}
</script>

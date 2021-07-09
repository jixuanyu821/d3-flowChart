<!--
 * @Author: jixuanyu
 * @Date: 2021-07-02 13:25:10
 * @LastEditors: jixuanyu
 * @Description: file content
-->
<template>
  <div class="svgContent">
    <svg
      draggable
      @mousedown="dragSvg"
      id="svg"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    ></svg>
  </div>
</template>
<script>
// eslint-disable-next-line no-unused-vars
import { linkHorizontal, stratify } from 'd3'
// eslint-disable-next-line no-unused-vars
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom'
// eslint-disable-next-line no-unused-vars
import { select, selectAll, event } from 'd3-selection'
import { hierarchy, tree } from 'd3-hierarchy'
// // eslint-disable-next-line no-unused-vars
import { drag } from 'd3-drag'
// import * as d3 from 'd3'
const [width, height, border] = [168, 66, 20]
let svg
export default {
  data() {
    return {
      treeData: {
        name: '节点1',
        id: 1,
        source: {
          x: 100,
          y: 50,
        },
        children: [
          {
            name: '节点2',
            id: 2,
            source: {
              x: 400,
              y: 10,
            },
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
    }
  },
  mounted() {
    this.initSvg()
  },
  methods: {
    initSvg() {
      let dom = select('#svg')
      // eslint-disable-next-line no-unused-vars
      let outG = dom.append('g')
      outG.attr('transform', zoomIdentity).attr('class', 'outG')
      svg = select('#svg .outG')
      let zoom = d3Zoom()
        .scaleExtent([0.5, 1.5])
        .on('zoom', function() {
          outG.attr('transform', event.transform)
        })
      select('#svg')
        .call(zoom)
        .on('dblclick.zoom', null)
      let $tree = tree()
      console.log(this.treeData)
      let hierarchyTree = hierarchy(this.treeData, (d) => d.children)
      hierarchyTree = $tree(hierarchyTree)
      let [nodes, links] = [hierarchyTree.descendants(), hierarchyTree.links()]
      this.nodes = nodes
      this.links = links
      this.drwaLine(links)
      this.drwaSvg(nodes)
      this.bindMouseOver()
      this.bindDrag()
    },
    /**
     * @description: 绘制svg
     * @param {*} data 数据
     * @param {*} x 如果有值 则说明有父级 需要连线
     * @param {*} y 如果有值 则说明有父级 需要连线
     */
    drwaSvg(data) {
      data.forEach((ele) => {
        svg
          .append('g')
          .attr('node-id', `${ele.data.id}`)
          .attr('sourceX', ele.data.source.x)
          .attr('sourceY', ele.data.source.y)
          .attr('class', 'nodeG')
        this.drawRect(`g[node-id='${ele.data.id}']`, [ele])
        this.drawText(`g[node-id='${ele.data.id}']`, [ele])
      })
    },
    /**
     * @description: 绘制方块
     * @param {*} select 选择器 type: Array
     * @param {*} data 数据 type: Array
     */
    drawRect(select, data) {
      // 绘制实体边框
      svg
        .select(select)
        .data(data)
        .append('rect')
        .attr('x', (d) => d.data.source.x)
        .attr('y', (d) => d.data.source.y)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'white') // 背景色
        .attr('stroke', '#999') // 边框颜色
        .attr('dragEnable', true)
        .attr('stroke-width', 1) // 边框
        .attr('rx', 10) // 圆角
        .attr('ry', 10)
        .attr('class', 'rect')
      // 绘制外部虚线边框
      svg
        .select(select)
        .data(data)
        .append('rect')
        .attr('x', (d) => d.data.source.x - border / 2)
        .attr('y', (d) => d.data.source.y - border / 2)
        .attr('width', width + border)
        .attr('height', height + border)
        .attr('fill', 'none') // 背景色
        .attr('stroke', '#999') // 边框颜色
        .attr('dragEnable', 'true')
        .attr('stroke-width', 1) // 边框
        .attr('stroke-dasharray', '20,10,5,5,5,10') // 边框
        .attr('rx', 4) // 圆角
        .attr('ry', 4)
        .attr('style', 'display:none')
        .attr('class', 'rectborder')
    },
    /**
     * @description: 添加文字
     * @param {*} select 选择器
     * @param {*} data 数据
     * @param {*} opacity 透明度
     */
    drawText(select, data, opacity = 1) {
      svg
        .select(select)
        .data(data)
        .append('text')
        .attr('x', (d) => {
          return d.data.source.x + width / 2
        })
        .attr('y', (d) => d.data.source.y + height / 2)
        .text((d) => {
          console.log(d, 'text')
          return `节点名：${d.data.name}`
        })
        .attr('class', 'text')
        .attr('fill', '#4c4c4c') // 字体颜色
        .attr('font-size', 12) // 字体大小
        .attr('text-align', 'center') // 居中
        .attr('dominant-baseline', 'middle') // 基于外部居中
        .attr('text-anchor', 'middle') // 基于外部居中
        .style('opacity', opacity)
    },
    /**
     * @description: 画连接线
     * @param {*} data
     * @param {*} dom
     * @return {*}
     */
    drwaLine(links) {
      // 绘制曲线
      var link = linkHorizontal() //设置曲线类型
        .x((d) => d.x)
        .y((d) => d.y)
      //  获取存放线条的容器
      let linkContanier = svg
        .append('g')
        .attr('class', 'linkContent')
        .selectAll('path')
        .data(links)
        .enter()
      console.log(linkContanier, 'linkContanier')
      linkContanier
        .append('path')
        .attr('data-link', (d) => `${d.source.data.id}-${d.target.data.id}`)
        .attr('d', (d) => {
          const startAxis = {
            x: d.source.data.source.x + width /2,
            y: d.source.data.source.y + height + 4,
          }
          const endAxis = {
            x: d.target.data.source.x  + width /2,
            y: d.target.data.source.y - 4,
          }
          return link({ source: startAxis, target: endAxis })
        })
        .style('fill', 'none')
        .style('stroke', '#333')
        .style('stroke-width', '2px')
      // 绘制圆点 两个 分别为起止点
      // 起点
      linkContanier
        .append('circle')
        .attr(
          'data-circle',
          (d) => `source${d.source.data.id}-${d.target.data.id}`
        )
        .attr('cx', (d) => d.source.data.source.x + width /2 )
        .attr('cy', (d) => d.source.data.source.y + height + 4)
        .attr('r', 4)
        .style('stroke', '#333')
        .attr('fill', '#fff')
      // 终点
      linkContanier
        .append('circle')
        .attr(
          'data-circle',
          (d) => `target${d.source.data.id}-${d.target.data.id}`
        )
        .attr('cx', (d) => d.target.data.source.x + width /2)
        .attr('cy', (d) => d.target.data.source.y -4)
        .attr('r', 4)
        .style('stroke', '#333')
        .attr('fill', '#fff')
    },
    /**
     * @description:
     * @param {*}
     * @return {*}
     */

    bindMouseOver() {
      svg
        .selectAll('.nodeG')
        .on('mouseover', function() {
          select(this)
            .select('.rect')
            .attr('stroke', '#2080f7')
        })
        .on('mouseout', function() {
          select(this)
            .select('.rect')
            .attr('stroke', '#999')
        })
        .on('click', function() {
          selectAll('.rectborder').attr('style', 'display:none')
          select(this)
            .select('.rectborder')
            .attr('style', '')
        })
    },

    bindDrag() {
      let _this = this
      const dragenvent = drag()
        .on('start', () => {})
        .on('end', function() {
          const targetDom = select(this)
          const { x, y } = event
          const [x1, y1] = [
            Number(targetDom.attr('sourceX')) + x,
            Number(targetDom.attr('sourceY')) + y,
          ]
          targetDom.attr('sourceX', x1)
          targetDom.attr('sourceY', y1)
          console.log(_this.treeData)
          const targetId = targetDom.attr('node-id')
          if (String(targetId) === String(_this.treeData.id)) {
            // 判断是否为主节点
            _this.treeData.source = { x: x1, y: y1 }
          } else {
            _this.treeData.children = _this.formateTree(
              targetId,
              _this.treeData.children,
              x1,
              y1
            )
            console.log(_this.treeData.children,'children')
          }
          svg.remove()
          _this.initSvg()
        })
        .on('drag', function() {
          const targetDom = select(this)
          const { x, y } = event
          const [x1, y1] = [
            Number(targetDom.attr('sourceX')) + x,
            Number(targetDom.attr('sourceY')) + y,
          ]
          targetDom
            .select('.rect')
            .attr('x', x1)
            .attr('y', y1)
          targetDom
            .select('.text')
            .attr('x', x1 + width / 2)
            .attr('y', y1 + height / 2)
          targetDom
            .select('.rectborder')
            .attr('x', x1 - border / 2)
            .attr('y', y1 - border / 2)
        })
      svg.selectAll('.nodeG').call(dragenvent)
    },
    formateTree(id, tree, x, y) {
      for (let index = 0; index < tree.length; index++) {
        let item = tree[index]
        if (String(item.id) === String(id)) {
          tree[index] = { ...item, source: { x, y } }
          break
        }
        if (item.children && item.children.node) {
          tree[index].children = this.formateTree(id, tree[index].children, x, y)
        }
      }
      return tree
    },
  },
}
</script>
<style scoped>
.svgContent {
  width: 800px;
  height: 600px;
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

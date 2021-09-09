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
// import { drag,mousemoved } from 'd3-drag'
// import * as d3 from 'd3'
const [width, height] = [168, 66]
let svg
export default {
  data() {
    return {
      tree: {
        name: '节点1',
        id: 1,
        source: {
          x: 100,
          y: 50,
        },
        target: {
          x: 400,
          y: 10,
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
      rect: [],
    }
  },
  mounted() {
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
    this.drwaSvg(this.tree)
    // this.dragNode()
  },
  methods: {
    /**
     * @description: 绘制svg
     * @param {*} data 数据
     * @param {*} x 如果有值 则说明有父级 需要连线
     * @param {*} y 如果有值 则说明有父级 需要连线
     */
    drwaSvg(data) {
      let hierarchyTree = hierarchy(data, (d) => d.children)
      let $tree = tree()
      console.log($tree)
      hierarchyTree = $tree(hierarchyTree)
      console.log(hierarchyTree)
      let [nodes, links] = [hierarchyTree.descendants(), hierarchyTree.links()]
      console.log(nodes)
      console.log(links)
      this.drwaLine(links)
      this.drawRect(nodes)
      this.drawText(nodes)
      // data.map((ele) => {
      //   this.rect.push(this.drawRect([ele]))
      //   this.drawText()
      //     this.drwaLine({ x, y }, { x: ele.source.x, y: ele.source.y })
      //   if (ele.children && ele.children.length > 0) {
      //     this.drwaSvg(ele.children, ele.source.x, ele.source.y)
      //   }
      // })
    },
    /**
     * @description: 绘制方块
     * @param {*} data 数据 type: Array
     */

    drawRect(data, opacity = 1) {
      svg
        .append('g')
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d) => d.data.source.x)
        .attr('y', (d) => d.data.source.y)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'white')
        .attr('stroke', '#999')
        .attr('dragEnable', true)
        .attr('stroke-width', 1)
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('opacity', opacity)
        .classed('rect', true)
        .classed('dragging', true)
    },
    /**
     * @description: 添加文字
     * @param {*} opacity 透明度
     */
    drawText(data, opacity = 1) {
      svg
        .append('g')
        .selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .attr('x', (d) =>
        {
          return d.data.source.x + width / 2
        } 
        )
        .attr('y', (d) => d.data.source.y + height / 2)
        .text((d) => {
          console.log(d,'text')
          return `节点名：${d.data.name}`
        })
        .attr('fill', '#4c4c4c')
        .attr('font-size', 12)
        .attr('text-align', 'center')
        .attr('dominant-baseline', 'middle')
        .style('opacity', opacity)
        .attr('text-anchor', 'middle')
    },
    /**
     * @description: 画连接线
     * @param {*} data
     * @param {*} dom
     * @return {*}
     */
    drwaLine(links) {
      // 绘制曲线
      var link = linkHorizontal()
        .x((d) => d.x)
        .y((d) => d.y)
      svg
        .append('g')
        .selectAll('path')
        .data(links)
        .enter()
        .append('path')
        .attr('d', (d) => {
          console.log(d)
          const startAxis = {
            x: d.source.data.source.x + width + 4,
            y: d.source.data.source.y + height / 2,
          }
          const endAxis = {
            x: d.target.data.source.x - 4,
            y: d.target.data.source.y + height / 2,
          }
          console.log(startAxis, endAxis)
          return link({ source: startAxis, target: endAxis })
        })
        .style('fill', 'none')
        .style('stroke', '#333')
        .style('stroke-width', '2px')
      // 绘制圆点 两个 分别为起止点
      svg
        .append('g')
        .selectAll('path')
        .data(links)
        .enter()
        .append('circle')
        .attr('cx', (d) => {
          console.log(d, 'circle')
          return d.source.data.source.x + width + 4
        })
        .attr('cy', (d) => {
          return d.source.data.source.y  + height / 2
        })
        .attr('r', 4)
        .style('stroke', '#333')
        .attr('fill', '#fff')
      svg
        .append('g')
        .selectAll('path')
        .data(links)
        .enter()
        .append('circle')
        .attr('cx', (d) => {
          console.log(d, 'circle')
          return d.target.data.source.x - 4
        })
        .attr('cy', (d) => {
          return d.target.data.source.y + height / 2
        })
        .attr('r', 4)
        .style('stroke', '#333')
        .attr('fill', '#fff')
    },
    dragSvg(e) {
      console.log(e)
    },
    dragNode() {
      const drag = drag()
        .on('start', () => {})
        .on('end', () => {})
        .on('drag', draged)
      this.rect.forEach((rect) => {
        rect.call(drag)
      })
      function draged(e) {
        console.log(e)
        const { x, y } = event
        select(this)
          .attr('x', x)
          .attr('y', y)
      }
      //  d3.select('#svg').call( d3.drag().on("start", (e)=>{
      //   // eslint-disable-next-line no-debugger
      //   debugger
      //   console.log(e.sourceEvent, e.sourceEvent)
      // }))
      //  d3.select('#svg').call( d3.drag().on("drag", (e)=>{
      //   // console.log(e.sourceEvent, e.sourceEvent)
      //    d3.select('#svg').attr('style',`transform:translate(${e.sourceEvent.offsetX}px,${e.sourceEvent.offsetY}px)`)
      // }))
      //  d3.selectAll('rect').call( d3.drag().on("end", (e)=>{
      //   this.tree =  this.formateTree(e.subject,this.tree)
      //   this.drwaSvg(this.tree)
      // }))
    },
    formateTree(node, tree) {
      for (let index = 0; index < tree.length; index++) {
        let item = tree[index]
        if (item.id === node.id) {
          item = { ...item, node }
        }
        if (item.children && item.children.node) {
          this.formateTree(node, item.children)
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
#svg:hover {
  cursor: grab;
}
#svg::backdrop {
}
</style>

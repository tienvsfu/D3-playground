import * as React from 'react';
import * as d3 from 'd3';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as _ from 'lodash';

import graphManipulationActions from '../graphMetadata/graphManipulationActions';
import { project, translate } from './treeManipulator';
import { d3Node, TreeType } from '../types';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from './constants';

import '../css/styles.scss';

const DEBUG = true;

// testing purposes
window['d3'] = d3;

interface ITreeManagerProps {
  dragBehavior: d3.DragBehavior<any, any, any>;
  onClick: Function;
  onTextClick: Function;
  onMouseOver: Function;
  onMouseOut: Function;
  root;
  updateNode;
  selectedNode;
  display;
  dx;
  dy;
  dx2;
  dy2;
}

class TreeManager extends React.Component<ITreeManagerProps, any> {
  private DOMSelectedNode;
  private transformContainer;
  private panZoomContainer;

  constructor(props) {
    super(props);
  }

  // thank you redux
  shouldComponentUpdate(nextProps) {
    const shouldUpdate = this.props.updateNode !== nextProps.updateNode;
    return shouldUpdate;
  }

  componentDidMount() {
    const self = this;

    const zoomBehavior = d3.zoom()
      .on('zoom', (d) => {
        console.log('THIS IS THE G ZOOM');
        const transform = self._getZoomTransform();
        this.transformContainer.attr('transform', transform.toString());
      });

    this.panZoomContainer.call(zoomBehavior);

    this.update(this.props.updateNode, this.props.root);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedNode) {
      this.updateSelectedNode(nextProps.selectedNode);
    } else if (this.DOMSelectedNode) {
      this.clearSelectedNode();
    }

    const shouldUpdate = this.props.updateNode !== nextProps.updateNode;

    if (shouldUpdate) {
      this.update(nextProps.updateNode, nextProps.root);
    }
  }

  render() {
    return (
      <g transform={`translate(${this.props.dx}, ${this.props.dy})`}>
        <rect style={{fill: "none", 'pointer-events': "all"}} width={960} height={1200} ref={(rect) => this.panZoomContainer = d3.select(rect)} />
        <g transform={`translate(${this.props.dx2}, ${this.props.dy2})`} ref={(element) => this.transformContainer = d3.select(element)} />
      </g>
    );
  }

  clearSelectedNode() {
    this.DOMSelectedNode.attr('class', 'inner');
  }

  _getZoomTransform() {
    const transform = d3.zoomTransform(this.panZoomContainer.node());
    const translatedTransform = transform.translate(this.props.dx2, this.props.dy2);

    return translatedTransform;
  }

  updateSelectedNode(selectedNode) {
    const context = this.transformContainer;
    const root = this.props.root;
    const self = this;

    const nodes = context.selectAll('.node')
      .data(root.descendants(), d => d.data.id);

    // update selected node
    nodes.selectAll('circle.inner')
      .attr('class', function(d: d3Node) {
        let className = 'inner';

        if (selectedNode && d.data.id == selectedNode.data.id) {
          // save node to deselect when updating
          self.DOMSelectedNode = d3.select(this);
          className += ' selected';
        }

        return `${className}`;
      });
  }

  update(source: d3Node, root: d3Node) {
    const self = this;
    const context = this.transformContainer;
    const transitionBehavior = d3.transition('myT').duration(750);

    function attachBehaviors() {
      const node = d3.select(this);
      const text = node.select('text');
      const circle = node.select('circle');

      // setup drag and click behaviors
      circle.call(self.props.dragBehavior);
      circle.on('click', (node) => {
        console.log('clicked the circle!');
        self.props.onClick(node);
        d3.event.stopPropagation();
      });

      text.on('click', (thisNode) => {
        self.props.onTextClick(thisNode);
        d3.event.stopPropagation();
      });
    }

    const nodes = context.selectAll('.node')
      .data(root.descendants(), d => d.data.id);

    const enterNodes = nodes.enter().append('g').attr('id', d => d.data.id);

    enterNodes.append('circle')
      .attr('r', 7.5)
      .attr('class', 'inner');

    enterNodes.append('circle')
      .attr('r', 20)
      .attr('class', 'ghost disabled')
      .attr('pointerEvents', 'mouseover')
      .on('mouseover', function(node) {
        self.props.onMouseOver(node, this);
      })
      .on('mouseout', function(node) {
        self.props.onMouseOut(node, this);
      });

    enterNodes
      .merge(nodes)
      .each(function(node) {
        const nodeContainer = d3.select(this);
        const imageContainer = nodeContainer.select('image');
        const textContainer = nodeContainer.select('text');

        const newNodeName = node.data.name;
        const newImgHref = node.data.image;

        if (node.data.image) {
          if (imageContainer.size() == 1) {
            // just update the href
            imageContainer.attr('href', newImgHref);
          } else {
            // create the image
            nodeContainer.append('image')
              .attr('href', node.data.image)
              .attr('width', IMAGE_WIDTH)
              .attr('height', IMAGE_HEIGHT)
              .attr('x', IMAGE_WIDTH * -0.5)
              .attr('y', IMAGE_HEIGHT * -0.5);

            // remove the circle
            nodeContainer.select('circle').remove();
          }
        }

        if (textContainer.size() == 1) {
          textContainer.text(newNodeName);
        } else {
          nodeContainer.append('text')
            .attr('dy', 3)
            .attr('x', (d: d3Node) => d.children ? -8 : 8)
            .attr('class', (d: d3Node) => d.children ? 'internal': 'leaf')
            .text(_ => {
              return node.data.name;
            });
        }
      });

    // stick in DOM
    const transform = `translate(${source.y}, ${source.x})`;
    let nodeTransform;
    let linkTransform;

    if (this.props.display === TreeType.VerticalTree) {
      nodeTransform = (d: d3Node) => `translate(${d.x}, ${d.y})`;
      linkTransform = (d: d3Node) => {
        return `M${d.x},${d.y}`
          + `C${d.parent.x + 100},${d.y}`
          + ` ${d.parent.x + 100},${d.parent.y}`
          + ` ${d.parent.x},${d.parent.y}`;
      };
    } else if (this.props.display === TreeType.Radial) {
      nodeTransform = (d: d3Node) => `translate(${d.x}, ${d.y})`;
      linkTransform = (d: d3Node) => {
        return "M" + (project(d.x0, d.y0))
            + "C" + (project(d.x0, (d.y0 + d.parent.y0) / 2))
            + " " + (project(d.parent.x0, (d.y0 + d.parent.y0) / 2))
            + " " + (project(d.parent.x0, d.parent.y0));
      };
    } else {
      console.log('wtf display??');
    }

    enterNodes
      .attr('transform', transform )
      .attr('style', 'fill-opacity: 1e-6')
      .merge(nodes)
      .transition(transitionBehavior)
      .attr('class', (d:d3Node) => {

        const className = d.children ? 'internal': 'leaf';
        return `node ${className}`;
      })
      .attr('transform', nodeTransform)
      .attr('style', 'fill-opacity: 1')
      .on('end', attachBehaviors);

    const exitNodes = nodes.exit()
      .transition(transitionBehavior)
      .attr('transform', `translate(${source.y}, ${source.x})` )
      .attr('style', 'fill-opacity: 1e-6')
      .remove();

    const linkTransitionBehavior = d3.transition('myT').duration(700);

    const links = context.selectAll('.link')
      .data(root.descendants().slice(1), d => d.data.id);

    const enterLinks = links.enter()
      .insert('path', 'g')
      .attr('d', (d: d3Node) => {
          return `M${source.y},${source.x}`
            + `C${source.y},${source.x}`
            + ` ${source.y},${source.x}`
            + ` ${source.y},${source.x}`
      })
      .merge(links)
      .transition(linkTransitionBehavior)
      .attr('class', 'link')
      .attr('d', linkTransform);

    const exitLinks = links.exit()
      .transition(linkTransitionBehavior)
      .attr('d', d => {
        return `M${source.y},${source.x}`
          + `C${source.y},${source.x}`
          + ` ${source.y},${source.x}`
          + ` ${source.y},${source.x}`
      })
      .remove();
  }
}

export default TreeManager;

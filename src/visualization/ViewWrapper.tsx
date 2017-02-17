import * as React from 'react';
import * as d3 from 'd3';
import * as TransitionGroup from 'react-addons-transition-group';

import { d3Node } from '../types';
import '../css/styles.scss';

const DEBUG = true;

// testing purposes
window['d3'] = d3;

interface ITreeManagerProps {
  graph: any;
  selectedNode: any;
  onRectClick: Function;
  zoomEnabled: boolean;
  // node specific
  dragBehavior: d3.DragBehavior<any, any, any>;
  onNodeClick: Function;
  onTextClick: Function;
  onMouseOver: Function;
  onMouseOut: Function;
}

export default function(WrappedComponent) {
  return class extends React.Component<ITreeManagerProps, any> {
    private transformContainer;
    private panZoomContainer;
    private zoomBehavior;

    constructor(props) {
      super(props);

      const self = this;
      this.zoomBehavior = d3.zoom()
        .on('zoom', (d) => {
          console.log('THIS IS THE G ZOOM');
          const transform = self._getZoomTransform();
          this.transformContainer.attr('transform', transform.toString());
        });
    }

    componentWillReceiveProps(nextProps: ITreeManagerProps) {
      const { zoomEnabled } = nextProps;
      const prevZoomEnabled = this.props.zoomEnabled;

      if (prevZoomEnabled !== zoomEnabled) {
        if (zoomEnabled) {
          this.panZoomContainer.call(this.zoomBehavior);
        } else {
          this.panZoomContainer.on('.zoom', null);
        }
      }
    }

    onRectClick() {
      this.props.onRectClick();
      console.log(`clicked the rect`);
    }

    render() {
      const { graph, selectedNode, onRectClick, ...passThroughProps } = this.props;
      return (
        <svg id="main" width={960} height={1600}
                onClick={this.onRectClick.bind(this)}
                style={{'backgroundColor': graph.color}}>
          <g ref={(rect) => this.panZoomContainer = d3.select(rect)} >
            <g transform={`translate(${graph.treeRoot.dx}, ${graph.treeRoot.dy})`} ref={(element) => this.transformContainer = d3.select(element)}>
                <WrappedComponent {...this.props} />
            </g>
          </g>
        </svg>
      );
    }

    _getZoomTransform() {
      const transform = d3.zoomTransform(this.panZoomContainer.node());
      const translatedTransform = transform.translate(this.props.graph.treeRoot.dx, this.props.graph.treeRoot.dy);

      return translatedTransform;
    }
  }
}

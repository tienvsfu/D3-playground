import * as d3 from 'd3';
import * as _ from 'lodash';

import { TREE_WIDTH, TREE_HEIGHT } from './constants';
import { ActionTypes } from '../app/actionTypes';
import { emptyTree } from '../app/initialState';
import { d3Node, EntityType, SelectedEntity, TreeReducerState, TreeType } from '../types';
import { attachIds, getNextId, findNode } from './treeManipulator';

function _sortTree(root) {
  const sorter = (a, b) => a.data.name.toLowerCase().localeCompare(b.data.name.toLowerCase());
  root.sort(sorter);
}

function _project(x, y) {
  var angle = (x - 90) / 180 * Math.PI, radius = y;
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

// function _reconstructTree(treeData, changedNodeId, previousState: TreeReducerState<string>, viewIndex: number, height: number, width: number, toggleIds?: Set<number>, display = previousState.display) {
function _reconstructTree(treeData, changedNodeId, previousState: TreeReducerState<string>, toggleIds?: Set<number>, display = previousState.display) {
  // pull view size data from previous state
  const { maxHeight, maxWidth, viewIndex } = previousState;

  const newRoot: d3Node = d3.hierarchy(treeData);
  let tree;

  if (display == TreeType.Radial) {
    // 360 500 worked
     tree = d3.tree().size([maxHeight / 3.33, maxWidth / 1.2]).separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });
  } else {
     tree = d3.tree().size([maxHeight, maxWidth]);
  }

  _sortTree(newRoot);
  tree(newRoot);

  newRoot.descendants().forEach((node: d3Node) => {
    if (display == TreeType.Radial) {
      // stash original coordinates
      node.x0 = node.x;
      node.y0 = node.y;

      [node.x, node.y] = _project(node.x, node.y);
      node.dx = 520;
      node.dy = 670;
    }

    // shift everything down
    node.x += maxHeight * viewIndex;
  });

  // toggle children
  const toggleCopy = toggleIds || new Set(previousState.toggleIds);
  newRoot.each((node: d3Node) => {
    if (toggleCopy.has(node.data.id)) {
      node._children = node.children;
      node.children = null;
    }
  });

  // also find the node that needs rerendering
  let updateNode = null;

  if (changedNodeId) {
    newRoot.each((node: d3Node) => {
      if (changedNodeId === node.data.id) {
        updateNode = node;
      }
    });
  } else {
    updateNode = newRoot;
  }

  return Object.assign({}, previousState, {
    raw: treeData,
    treeRoot: newRoot,
    toggleIds: toggleCopy,
    updateNode,
    display
  });
}



export default function graphReducer(state = emptyTree, action): TreeReducerState<string> {
  // const { graph, height, width, viewIndex } = action;
  const { graph } = action;
  const dataCopy = Object.assign({}, state.raw);

  switch (action.type) {
    case ActionTypes.SET_VIEWPORT_SIZE: {
      const { maxHeight, maxWidth, viewIndex } = action;

      return Object.assign({}, state, {
        maxHeight,
        maxWidth,
        viewIndex
      });
    }
    case ActionTypes.LOAD_GRAPH_SUCCESS: {
      attachIds(graph);

      return _reconstructTree(graph, null, state);
    }
    case ActionTypes.ADD_NODE: {
      const { newNode, destNode } = action;

      const destNodeId = destNode.data.id;
      const destInData = findNode(dataCopy, destNodeId).node;
      newNode.id = getNextId();

      const destChildren = destInData.children || destInData._children;
      if (destChildren) {
        destChildren.push(newNode);
      } else {
        destInData.children = [newNode];
      }

      return _reconstructTree(dataCopy, destNodeId, state);
    }
    case ActionTypes.TOGGLE_NODE: {
      const { node, destNode } = action;

      const toggleCopy = new Set(state.toggleIds);

      if (toggleCopy.has(node.data.id)) {
        toggleCopy.delete(node.data.id);
      } else {
        toggleCopy.add(node.data.id);
      }

      return _reconstructTree(dataCopy, node.data.id, state, toggleCopy);
    }
    case ActionTypes.EDIT_NODE: {
      const { node, editData } = action;

      const nodeId = node.data.id;
      let nodeInData = findNode(dataCopy, nodeId).node;

      _.forEach(editData, (value, key) => {
        nodeInData[key] = value;
      });

      return _reconstructTree(dataCopy, nodeId, state);
    }
    case ActionTypes.DELETE_NODE: {
      const { node } = action;

      const nodeId = node.data.id;
      const parent = findNode(dataCopy, nodeId).parent;

      // deleting root
      if ( parent === null ) {
        console.log(`deleted the whole damn tree!`);
        return emptyTree;
      } else {
        let childIndex;

        // delete child in parent
        _.forEach(parent.children, (child, index) => {
          if (child.id === nodeId) {
            childIndex = index;
          }
        });

        parent.children.splice(childIndex, 1);

        return _reconstructTree(dataCopy, parent.id, state);
      }
    }
    case ActionTypes.ATTACH_IMAGE: {
      const { node, imageHref } = action;

      const nodeId = node.data.id;
      const nodeInData = findNode(dataCopy, nodeId).node;

      nodeInData.image = imageHref;

      return _reconstructTree(dataCopy, nodeId, state);
    }
    case ActionTypes.TOGGLE_TREE_DISPLAY: {
      const toggleCopy = new Set(state.toggleIds);
      const toggleView = state.display === TreeType.Radial ? TreeType.VerticalTree : TreeType.Radial;

      return _reconstructTree(dataCopy, null, state, toggleCopy, toggleView);
    }
    default: {
      return state;
    }
  }
}

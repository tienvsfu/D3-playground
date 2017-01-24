import * as d3 from 'd3';
import * as _ from 'lodash';

import { TREE_WIDTH, TREE_HEIGHT } from './constants';
import { ActionTypes } from '../app/actionTypes';
import { emptyTree, initialState } from '../app/initialState';

import { d3Node, GraphAction, GraphsData, GraphType, TreeReducerState, AllGraphsReducerState } from '../types';
import graphReducer from './graphReducer';
import { TreeHelper } from './treeHelper';

// corresponds to the order in GraphTypes
// make this better if necessary
const ridToReducer = function(graphType) {
  switch (graphType) {
    case GraphType.Tree: {

    }
    default: {
      return graphReducer;
    }
  }
}

const forwardActionToReducer = function(previousState: TreeReducerState<string>, actionType, viewHeight, viewIndex, params?): TreeReducerState<string> {
  let reducer;

  switch (previousState.type) {
    case GraphType.Tree: {

    }
    default: {
      reducer = graphReducer;
    }
  }

  const subState = reducer(previousState, {
    type: actionType,
    height: viewHeight,
    width: TREE_WIDTH,
    viewIndex,
    graph: previousState.value,
    ...params
  });

  return subState;
}

const executeActionOnNode = function(subStates: Array<TreeReducerState<string>>, action, node: d3Node, params?) {
  const graphRid = TreeHelper.getRid(node);
  const previousSubState = subStates[graphRid];
  const viewHeight = TREE_HEIGHT / subStates.length;

  let subState = forwardActionToReducer(previousSubState, action, viewHeight, graphRid, params);

  // we did something that deleted the root
  if (subState == emptyTree) {
    subStates.splice(graphRid, 1);
  } else {
    subState.treeRoot.rid = graphRid;
    subState.type = previousSubState.type;
    subStates[graphRid] = subState;
  }

  return subState;
}

export default function mainGraphReducer(state = initialState.main, action: GraphAction): AllGraphsReducerState {
  switch (action.type) {
    case ActionTypes.LOAD_GRAPH_SUCCESS: {
      let subStates = [];
      let viewHeight = TREE_HEIGHT / action.graph.length;

      for (let i = 0; i < action.graph.length; i++) {
        const graph = action.graph[i];
        let subState = forwardActionToReducer(graph, ActionTypes.LOAD_GRAPH_SUCCESS, viewHeight, i);

        // to be able to trace a node to corresponding substate
        subState.treeRoot.rid = i;
        subState.type = graph.type;
        subStates.push(subState);
      }

      // console.log(newState);
      return Object.assign({}, state, { subStates });
    }
    case ActionTypes.ADD_NODE: {
      const { newNode, destNode } = action;
      executeActionOnNode(state.subStates, ActionTypes.ADD_NODE, destNode, { newNode, destNode });

      return Object.assign({}, state);
    }
    case ActionTypes.TOGGLE_NODE: {
      const { node } = action;
      executeActionOnNode(state.subStates, ActionTypes.TOGGLE_NODE, node, { node });

      return Object.assign({}, state);
    }
    case ActionTypes.EDIT_NODE: {
      const { node, editData } = action;
      executeActionOnNode(state.subStates, ActionTypes.EDIT_NODE, node, { node, editData });

      return Object.assign({}, state);
    }
    case ActionTypes.DELETE_NODE: {
      const { node } = action;
      executeActionOnNode(state.subStates, ActionTypes.DELETE_NODE, node, { node });

      return Object.assign({}, state);
    }
    // src, dest
    case ActionTypes.MOVE_NODE: {
      const { src, dest } = action;
      const srcCopy = Object.assign({}, src.data);

      executeActionOnNode(state.subStates, ActionTypes.ADD_NODE, dest, { newNode: srcCopy, destNode: dest });
      executeActionOnNode(state.subStates, ActionTypes.DELETE_NODE, src, { node: src });

      return Object.assign({}, state);
    }
    case ActionTypes.ATTACH_IMAGE: {
      const { node, imageHref } = action;

      executeActionOnNode(state.subStates, ActionTypes.ATTACH_IMAGE, node, { node, imageHref });
      return Object.assign({}, state);
    }
    default: {
      return state;
    }
  }
}

import * as d3 from 'd3';
import * as _ from 'lodash';

import { TREE_WIDTH, TREE_HEIGHT } from './constants';
import { ActionTypes } from '../app/actionTypes';
import initialState from '../app/initialState';
import { EntityType, SelectedEntity } from '../types';
import graphReducer from './graphReducer';

const ridToReducer = {
  tree: graphReducer
};

const _getRid = (node) => {
  const ancestors = node.ancestors();
  return ancestors[ancestors.length - 1].rid;
}

export default function mainGraphReducer(state = initialState.main, action) {
  switch (action.type) {
    case ActionTypes.LOAD_GRAPH_SUCCESS: {
      let subStates = [];
      let viewHeight = TREE_HEIGHT / action.graph.length;

      for (let i = 0; i < action.graph.length; i++) {
        const graph = action.graph[i];
        const subState = ridToReducer[graph.type](null, {
          type: ActionTypes.LOAD_GRAPH_SUCCESS,
          height: viewHeight,
          width: TREE_WIDTH,
          viewIndex: i,
          graph: graph.value
        });

        // to be able to trace a node to corresponding substate
        subState.root['rid'] = i;
        subState.type = graph.type;
        subStates.push(subState);
      }

      // console.log(newState);
      return Object.assign({}, state, { subStates });
    }
    case ActionTypes.ADD_NODE: {
    }
    case ActionTypes.DELETE_NODE: {

    }
    // src, dest
    case ActionTypes.MOVE_NODE: {
      const { src, dest } = action;
      const [srcRid, destRid] =  [src, dest].map(_getRid);

      let viewHeight = TREE_HEIGHT / state.subStates.length;
      let [srcGraph, destGraph] = [state.subStates[srcRid], state.subStates[destRid]];

      // delete in src
      const subSrcState = ridToReducer[srcGraph.type](srcGraph, {
        type: ActionTypes.DELETE_NODE,
        height: viewHeight,
        width: TREE_WIDTH,
        viewIndex: srcRid,
        graph: srcGraph,
        nodeId: src.data.id
      });

      subSrcState.root['rid'] = srcRid;
      subSrcState.type = srcGraph.type;

      // add in dest
      const subDestState = ridToReducer[destGraph.type](destGraph, {
        type: ActionTypes.ADD_NODE,
        height: viewHeight,
        width: TREE_WIDTH,
        viewIndex: destRid,
        graph: destGraph,
        newNode: src.data,
        destNodeId: dest.data.id
      });

      subDestState.root['rid'] = destRid;
      subDestState.type = destGraph.type;

      // no need to copy again, subreducers already make a new copy
      state.subStates[srcRid] = subSrcState;
      state.subStates[destRid] = subDestState;

      return Object.assign({}, state);
    }
    default: {
      return state;
    }
  }
}

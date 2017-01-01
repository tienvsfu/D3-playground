import { ActionTypes, NodeAction } from '../actions/actionTypes';
import initialState from './initialState';
import { EntityType, SelectedEntity } from '../types';

export default function selectedEntityReducer(state: SelectedEntity = initialState.selectedEntity, action: NodeAction) {
  switch (action.type) {
    case ActionTypes.SELECT_NOTHING: {
      return Object.assign({}, state,
        {
          type: EntityType.Nothing,
          id: 0
        });
    }
    case ActionTypes.ADD_NODE_SUCCESS: {
      return state;
    }
    case ActionTypes.EDIT_NODE: {
      return Object.assign({}, state,
        {
          type: EntityType.Node,
          id: 2,
          data: action.nodeData
        });
    }
    case ActionTypes.SELECT_NETWORK: {
      return Object.assign({}, state,
        {
          type: EntityType.Network,
          id: 1
        });
    }
    case ActionTypes.SELECT_NODE: {
      return Object.assign({}, state,
        {
          type: EntityType.Node,
          id: 2,
          data: action.nodeData
        });
    }
    default: {
      return state;
    }
  }
}

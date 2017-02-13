import { ActionTypes } from '../app/actionTypes';
import initialState from '../app/initialState';
import { EntityType, SelectedEntity } from '../types';

export default function selectedEntityReducer(state: SelectedEntity = initialState.selectedEntity, action) {
  switch (action.type) {
    case ActionTypes.SELECT_NOTHING: {
      return Object.assign({}, state,
        {
          type: EntityType.Nothing,
          id: 0
        });
    }
    case ActionTypes.SELECT_GRAPH: {
      const { graphRid, graphName } = action

      return Object.assign({}, state,
        {
          type: EntityType.Graph,
          id: 1,
          node: null,
          graph: {
            name: graphName,
            rid: graphRid
          }
        });
    }
    case ActionTypes.SELECT_NODE: {
      const { htmlCoords } = action;

      return Object.assign({}, state,
        {
          type: EntityType.Node,
          id: 2,
          node: action.node,
          htmlCoords
        });
    }
    default: {
      return state;
    }
  }
}

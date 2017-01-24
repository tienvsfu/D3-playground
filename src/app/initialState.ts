import { ReduxStore, EntityType, GraphType } from '../types';

export const initialState = {
  selectedEntity: {
    type: EntityType.Nothing,
    id: 0,
    data: null,
    node: null
  },
  main: {
    subStates: []
  },
  editBox: {
    show: false,
    popup: false,
    htmlCoords: {
      x: 0,
      y: 0
    }
  }
};

export default initialState;

/* Custom initial states */
export const emptyTree = {
  type: GraphType.Tree,
  raw: {
    name: 'empty tree'
  },
  treeRoot: null,
  editMode: 'None',
  toggleIds: new Set(),
  updateNode: null
};

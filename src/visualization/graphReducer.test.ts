import * as expect from 'expect';
import graphReducer from './graphReducer';
import { emptyTree } from '../app/initialState';
import { attachIds } from './treeManipulator';
import * as graphManipulationActions from '../graphMetadata/graphManipulationActions';
import * as loadGraphActions from '../graphMetadata/loadGraphActions';

describe('Graph Reducer', () => {
  beforeEach(() => {
    this.raw = {
      name: 'a',
      children: [
        {
          name: 'b',
          children: [
            {
              name: 'b1'
            },
            {
              name: 'b2'
            }
          ]
        },
        {
          name: 'c',
          children: [
            {
              name: 'c1'
            },
            {
              name: 'c2'
            }
          ]
        }
      ]
    };

    attachIds(this.raw);

    this.srcNode = {
      parent: {
        data: {
          id: 0
        }
      },
      data: {
        id: 2
      }
    };
  });

  it('should generate a simple tree when LOAD_GRAPH_SUCCESS', () => {
    const data = {
      name: 'a',
      children: [
        {
          name: 'b'
        },
        {
          name: 'c'
        }
      ]
    };

    const action = loadGraphActions.loadGraphSuccess(data);
    const newState = graphReducer(emptyTree, action);

    expect(newState.raw).toEqual(data);
    expect(newState.treeRoot['descendants']().length).toEqual(3);
    expect(newState.treeRoot['leaves']().length).toEqual(2);
  });

  it('should generate a tree with just a root when data is empty for LOAD_GRAPH_SUCCESS', () => {
    const data = {};

    const action = loadGraphActions.loadGraphSuccess(data);
    const newState = graphReducer(emptyTree, action);

    expect(newState.raw).toEqual(data);
    expect(newState.treeRoot['descendants']().length).toEqual(1);
    expect(newState.treeRoot['leaves']().length).toEqual(1);
  });

  it('should generate a tree with just a root when data has one item for LOAD_GRAPH_SUCCESS', () => {
    const data = {
      name: 'a'
    };

    const action = loadGraphActions.loadGraphSuccess(data);
    const newState = graphReducer(emptyTree, action);

    expect(newState.raw).toEqual(data);
    expect(newState.treeRoot['descendants']().length).toEqual(1);
    expect(newState.treeRoot['leaves']().length).toEqual(1);
  });

  it('should add a node to valid leaf dest when ADD_NODE', () => {
    const initialGraphState = Object.assign({}, emptyTree, { raw: this.raw });
    const newNode = {
      name: 'test!',
      value: 1
    };

    const action = graphManipulationActions.addNode(newNode, 6);
    const newState = graphReducer(initialGraphState, action);
    expect(newState.treeRoot['descendants']().length).toEqual(8);
    expect(newState.treeRoot['leaves']().length).toEqual(4);
  });

  it('should add a node to valid non-leaf dest when ADD_NODE', () => {
    const initialGraphState = Object.assign({}, emptyTree, { raw: this.raw });
    const newNode = {
      name: 'test!',
      value: 1
    };

    const action = graphManipulationActions.addNode(newNode, 0);
    const newState = graphReducer(initialGraphState, action);
    expect(newState.treeRoot['descendants']().length).toEqual(8);
    expect(newState.treeRoot['leaves']().length).toEqual(5);
  });

  it('should delete a node with children when DELETE_NODE', () => {
    const initialGraphState = Object.assign({}, emptyTree, { raw: this.raw });

    const action = graphManipulationActions.deleteNode(4);
    const newState = graphReducer(initialGraphState, action);
    expect(newState.treeRoot['descendants']().length).toEqual(4);
    expect(newState.treeRoot['leaves']().length).toEqual(2);
  });

  it('should delete a leaf when DELETE_NODE', () => {
    const initialGraphState = Object.assign({}, emptyTree, { raw: this.raw });

    const action = graphManipulationActions.deleteNode(6);
    const newState = graphReducer(initialGraphState, action);
    expect(newState.treeRoot['descendants']().length).toEqual(6);
    expect(newState.treeRoot['leaves']().length).toEqual(3);
  });

  it('should return empty root when DELETE_NODE on root', () => {
    const initialGraphState = Object.assign({}, emptyTree, { raw: this.raw });

    const action = graphManipulationActions.deleteNode(0);
    const newState = graphReducer(initialGraphState, action);
    expect(newState.treeRoot).toEqual({});
  });
});

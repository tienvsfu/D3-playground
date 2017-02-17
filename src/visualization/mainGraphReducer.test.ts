// import * as d3 from 'd3';
// import * as expect from 'expect';
// import * as sinon from 'sinon';

// import mainGraphReducer from './mainGraphReducer';
// import { emptyTree, initialState } from '../app/initialState';
// import * as graphManipulationActions from '../graphMetadata/graphManipulationActions';
// import * as loadGraphActions from '../graphMetadata/loadGraphActions';
// import { TreeHelper } from './treeHelper';
// import { GraphType } from '../types';

// describe('Main Graph Reducer', () => {
//   before(() => {
//     this.rootOne = {};
//     this.rootTwo = {};
//     this.leafOne = {};
//     this.leafTwo = {};
//   })

//   beforeEach(() => {
//     const [rawOne, rootOne, internalOne, leafOne]  = TreeHelper.generateTree(6, 0);
//     const [rawTwo, rootTwo, internalTwo, leafTwo] = TreeHelper.generateTree(6, 1);

//     this.rootOne = rootOne;
//     this.internalOne = internalOne;
//     this.leafOne = leafOne;

//     this.rootTwo = rootTwo;
//     this.internalTwo = internalTwo;
//     this.leafTwo = leafTwo;

//     const rawStateOne = Object.assign({}, emptyTree, { raw: rawOne, type: GraphType.Tree, treeRoot: rootOne });
//     const rawStateTwo = Object.assign({}, emptyTree, { raw: rawTwo, type: GraphType.Tree, treeRoot: rootTwo });

//     this.stub = sinon.stub(TreeHelper, 'getRid')
//       .withArgs(this.rootOne).returns(0)
//       .withArgs(this.internalOne).returns(0)
//       .withArgs(this.leafOne).returns(0)
//       .withArgs(this.rootTwo).returns(1)
//       .withArgs(this.internalTwo).returns(1)
//       .withArgs(this.leafTwo).returns(1);

//     this.mockState = Object.assign({}, initialState.main, { subStates: [rawStateOne, rawStateTwo] });
//   });

//   afterEach(() => {
//     TreeHelper.getRid['restore']();
//   });

//   it('should forward to tree reducer when ADD_NODE', () => {
//     const mockNode = {
//       name: 'mocky'
//     };

//     const action = graphManipulationActions.addNode(mockNode, this.internalOne);
//     const newState = mainGraphReducer(this.mockState, action);

//     expect(newState.subStates[0].treeRoot.descendants().length).toEqual(8);
//   });

//   it('should forward to tree reducer when DELETE_NODE', () => {
//     const action = graphManipulationActions.deleteNode(this.internalOne);
//     const newState = mainGraphReducer(this.mockState, action);

//     expect(newState.subStates[0].treeRoot.descendants().length).toEqual(4);
//   });

//   it('should move node to a non-leaf when MOVE_NODE', () => {
//     const action = graphManipulationActions.moveNode(this.leafTwo, this.rootOne);
//     const newState = mainGraphReducer(this.mockState, action);

//     expect(this.stub.callCount).toEqual(1);
//     expect(newState.subStates[0].treeRoot.descendants().length).toEqual(8);
//     expect(newState.subStates[1].treeRoot.leaves().length).toEqual(3);
//   });

//   it('should move node to a leaf when MOVE_NODE', () => {
//     const action = graphManipulationActions.moveNode(this.leafTwo, this.leafOne);
//     const newState = mainGraphReducer(this.mockState, action);

//     expect(this.stub.callCount).toEqual(1);
//     expect(newState.subStates[0].treeRoot.descendants().length).toEqual(8);
//     expect(newState.subStates[1].treeRoot.leaves().length).toEqual(3);
//   });

//   it('should move a whole tree when MOVE_NODE', () => {
//     const action = graphManipulationActions.moveNode(this.rootOne, this.rootTwo);
//     const newState = mainGraphReducer(this.mockState, action);

//     expect(newState.subStates[0].treeRoot.descendants().length).toEqual(14);
//     expect(newState.subStates.length).toEqual(1);
//   });
// })

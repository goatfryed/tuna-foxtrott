import * as actions from "./actions";

export * from './actions';

export type ActionCreators = typeof actions[keyof typeof actions];
export type DomainAction = ReturnType<ActionCreators>;
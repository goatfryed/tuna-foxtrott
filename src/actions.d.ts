
import * as actions from "./actions";
import {Action} from "./actions";

export type ActionCreators = typeof actions[keyof typeof actions];
export type DomainAction = ReturnType<ActionCreators>;
export type DomainActionTypes = DomainAction['type'];
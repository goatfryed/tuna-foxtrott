import {Cell, PlayerUnit} from "../model";
import {Adventure} from "../model/Adventure";
import {action} from "mobx";

/**
 * business logic should be tied to the model
 * All actions here should just be callback creators
 * to delay execution of that business logic and bind arguments
 *
 * Please be aware, that ActionCreator and Action type are inferred from all exports of this file.
 * Therefore
 */

export enum ActionType {
    SELECT = "SELECT",
    MOVE = "MOVE",
    ATTACK = "ATTACK",
    UNSELECT = "UNSELECT",
}

export interface Action {
    run(): void,
    type: ActionType;
}

export function selectAction(adventure: Adventure, unit: PlayerUnit) {
    return ActionManager.asAction(ActionType.SELECT, () => adventure.activeUnit = unit);
}

// noinspection JSUnusedLocalSymbols
export function attackAction(attacker: PlayerUnit, target: PlayerUnit) {
    return ActionManager.asAction(ActionType.ATTACK, () => {
        target.receiveAttack(attacker);
    });
}

export function unselectAction(adventure: Adventure) {
    return ActionManager.asAction(ActionType.UNSELECT, () => adventure.activeUnit = null);
}

export class ActionManager {
    constructor(private adventure: Adventure) {
    }

    move(unit: PlayerUnit, cell: Cell) {
        if (cell.unit !== null || unit.cell === null || cell.unit !== this.adventure.activeUnit) {
            return;
        }
        const path = cell.getManhattenDistance(unit.cell);
        if (path > unit.remainingMovePoints) {
            return;
        }
        return ActionManager.asAction(
            ActionType.MOVE,
            action(() => {
                unit.cell = cell;
                unit.spentMovePoints(path);
            })
        );
    }

    static asAction(type: ActionType, run: () => void): Action {
        return {
            type,
            run,
        }
    }
}
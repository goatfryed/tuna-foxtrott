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
    SELECT = "select",
    MOVE = "move",
    ATTACK = "attack",
    UNSELECT = "unselect",
}

export interface Action {
    run(): void,
    type: ActionType;
}

export class ActionManager {

    constructor(protected adventure: Adventure) {}

    getDefaultInteraction(cell: Cell): Action|null {
        const activeUnit = this.adventure.activeUnit;
        const target = cell.unit;

        if (
            activeUnit === null
            || activeUnit === target
            || !this.canAct(activeUnit)
            || activeUnit.cell === null
            || !activeUnit.isAlive
        ) {
            return null;
        }

        if (target === null) {
            const path = cell.getManhattenDistance(activeUnit.cell);
            if (path > activeUnit.remainingMovePoints) {
                return null;
            }
            return ActionManager.asAction(
                ActionType.MOVE,
                action(() => {
                    activeUnit.cell = cell;
                    activeUnit.spentMovePoints(path);
                })
            );
        }

        if (
            activeUnit.player !== target.player
            && target.isAlive
            && activeUnit.canAttack(target)
        ) {
            return ActionManager.asAction(
                ActionType.ATTACK, () => {
                    target.dealDamage(1);
                    activeUnit.exhausted = true;
                    this.adventure.endTurn();
                });
        }

        return null;
    }

    canAct(unit: PlayerUnit) {
        return unit === this.adventure.activeUnit
            && unit.player === this.adventure.currentPlayer
            && unit.isAlive
        ;
    }

    static asAction(type: ActionType, run: () => void): Action {
        return {
            type,
            run,
        }
    }
}
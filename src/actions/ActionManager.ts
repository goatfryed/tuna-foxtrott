import {Adventure} from "../model/Adventure";
import {action, observable} from "mobx";
import {NotNull} from "../helpers";
import {Cell} from "../model/board";
import {IngameUnit} from "../model/IngameUnit";
import {StandardAttack} from "./StandardAttack";
import {StandardMovement} from "./StandardMovement";
import {Path} from "../service/pathfinder";
import {Action, InteractionIntent, InteractionRequest} from "./index";

const standardActions = [
    StandardAttack,
    StandardMovement,
];

export class ActionManager {

    constructor(protected adventure: Adventure) {}

    @observable interactionRequest: InteractionRequest|null = null;

    get interactionIntents(): InteractionIntent[] {
        const interactionRequest = this.interactionRequest;
        if (interactionRequest === null) return [];

        const unit = this.adventure.activeUnit;
        if (unit?.specials === undefined) return [];

        return unit.specials
            .map(value => ({
                name: value.name,
                execute: value.actionFactory(unit, interactionRequest.cell)
            }))
            .filter(
                (action): action is InteractionIntent  => action.execute !== null
            )
        ;
    }

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

        const context = {adventure: this.adventure};

        for (let ability of standardActions) {
            const action = ability.implementation
                .apply(activeUnit, context)
                ?.apply(cell)
            ;
            if (action) {
                return {
                    type: ability.type,
                    use: action,
                }
            }
        }

        return null;
    }

    doMoveAction(unit: IngameUnit, path: Path) {
        return action(() => {
            unit.cell = path.steps[path.steps.length - 1].cell;
            unit.spentMovePoints(path.cost);
        });
    }

    attackActionOrNull(unit: IngameUnit, target: IngameUnit) {
        if (unit.canAttack(target)) {
            return action(() => {
                target.dealDamage(1);
                unit.exhausted = true;
                this.adventure.endTurn();
            });
        }
        return null;
    }

    canAct(unit: IngameUnit): unit is NotNull<IngameUnit, "cell"> {
        return unit === this.adventure.activeUnit
            && unit.cell !== null
            && unit.isAlive
        ;
    }
}
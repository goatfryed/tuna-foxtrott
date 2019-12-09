import {Adventure} from "../model/Adventure";
import {action, observable} from "mobx";
import {definedValue, NotNull} from "../helpers";
import {Cell} from "../model/board";
import {IngameUnit} from "../model/IngameUnit";
import {StandardAttack} from "./StandardAttack";
import {StandardMovement} from "./StandardMovement";
import {Path} from "../service/pathfinder";
import {
    AbilityUse,
    Action,
    InteractionRequest,
    isAbilityRequest,
    isCellInteractionRequest,
    isCompleteIntend
} from "./index";
import {assertNever} from "../Utility";

const standardActions = [
    StandardAttack,
    StandardMovement,
];

export class ActionManager {

    constructor(protected adventure: Adventure) {}

    @observable interactionRequest: InteractionRequest|null = null;

    get interactionIntend() {
        if (this.interactionRequest === null || !isCompleteIntend(this.interactionRequest)) {
            return null;
        }

        return this.interactionRequest.ability.apply(this.interactionRequest.cell);
    }

    get expectedAbilityIntends(): AbilityUse[] {
        const interactionRequest = this.interactionRequest;
        if (interactionRequest === null) return [];

        if (isAbilityRequest(interactionRequest)) {
            return [];
        }
        if (!isCellInteractionRequest(interactionRequest)) {
            assertNever(interactionRequest, "interaction request of unexpected mix type");
        }

        const unit = this.adventure.activeUnit;
        if (unit?.abilities === undefined) return [];

        return unit.abilities
            .map(ability => ability.apply({adventure: this.adventure}))
            .filter(definedValue)
            .map(ability => ability.apply(interactionRequest.cell))
            .filter(definedValue)
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
            || !activeUnit.isCombatReady
        ) {
            return null;
        }

        const context = {adventure: this.adventure};

        for (let ability of standardActions) {
            const action = ability
                .apply(activeUnit)
                ?.apply(context)
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
                target.dealHealthDamage(1);
                unit.mainActionUsed = true;
                this.adventure.endTurn();
            });
        }
        return null;
    }

    canAct(unit: IngameUnit): unit is NotNull<IngameUnit, "cell"> {
        return unit === this.adventure.activeUnit
            && unit.cell !== null
            && unit.isCombatReady
        ;
    }
}
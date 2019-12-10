import {Adventure} from "../model/Adventure";
import {action, computed, observable} from "mobx";
import {definedValue, NotNull} from "../helpers";
import {Cell} from "../model/board";
import {IngameUnit} from "../model/IngameUnit";
import {Path} from "../service/pathfinder";
import {
    AbilityUse,
    IngameAbility,
    InteractionRequest,
    isAbilityRequest,
    isCellInteractionRequest,
    isCompleteIntend
} from "./index";
import {assertNever} from "../Utility";

export class ActionManager {

    constructor(protected adventure: Adventure) {
    }

    @observable interactionRequest: InteractionRequest | null = null;
    @observable.ref abilityIntend: IngameAbility|null = null;

    get interactionIntend() {
        if (this.interactionRequest === null || !isCompleteIntend(this.interactionRequest)) {
            return null;
        }

        return this.interactionRequest.ability.apply(this.interactionRequest.cell);
    }

    @computed
    get abilities(): IngameAbility[] {
        const unit = this.adventure.activeUnit;
        if (!unit?.abilities) return [];

        return unit.abilities
            .map(ability => ability.apply({adventure: this.adventure}))
            .filter(definedValue)
        ;
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

        return this.abilities
            .map(ability => ability.apply(interactionRequest.cell))
            .filter(definedValue)
        ;
    }

    getDefaultInteraction(cell: Cell): AbilityUse|null {

        if (this.abilityIntend) {
            return this.abilityIntend.apply(cell);
        }

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

        return activeUnit.abilities
            .filter(ability => ability.type.isStandard)
            .map(action => action.apply(context)?.apply(cell))
            .filter(definedValue)
            [0] || null
        ;
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
import {Adventure} from "../model/Adventure";
import {action, computed, observable} from "mobx";
import {definedValue, NotNull} from "../helpers";
import {Cell} from "../model/board";
import {IngameUnit} from "../model/IngameUnit";
import {Path} from "../service/pathfinder";
import {AbilityContext, AbilityUse, IngameAbility} from "./index";

export class ActionManager {

    readonly context: AbilityContext;

    constructor(protected adventure: Adventure) {
        this.context = {
            adventure,
        }
    }

    @observable.ref cellIntend: Cell|null = null;
    @observable.ref abilityIntend: IngameAbility|null = null;

    @computed
    get abilities(): IngameAbility[] {
        const unit = this.adventure.activeUnit;
        if (!unit?.abilities) return [];

        return unit.abilities
            .map(ability => ability.apply({adventure: this.adventure}))
            .filter(definedValue)
        ;
    }

    get suggestedAbilities(): AbilityUse[] {

        if (!this.cellIntend) return [];
        const cellIntend = this.cellIntend;

        return (this.abilityIntend !== null ?
                [this.abilityIntend]
                : (this.adventure.activeUnit?.abilities ?? [])
                    .map(ability => ability.apply(this.context))
                    .filter(definedValue)
            )
            .map(ability => ability.apply(cellIntend))
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

        return activeUnit.abilities
            .filter(ability => ability.type.isStandard)
            .map(action => action.apply(this.context)?.apply(cell))
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
import {Adventure} from "../model/Adventure";
import {action, computed, observable} from "mobx";
import {definedValue, NotNull} from "../helpers";
import {Cell} from "../model/board";
import {IngameUnit} from "../model/IngameUnit";
import {DomainAction, IngameAbility} from "./index";

export class ActionManager {
    constructor(protected adventure: Adventure) {}

    @observable.ref cellIntend: Cell|null = null;
    @observable.ref abilityIntend: IngameAbility<DomainAction>|null = null;
    @observable.ref hoveredCell: Cell|null = null;

    @computed
    get abilities(): IngameAbility<DomainAction>[] {
        const unit = this.adventure.activeUnit;
        if (!unit?.abilities) return [];

        return unit.abilities
            .map(ability => ability.apply(this.adventure))
            .filter(definedValue)
        ;
    }

    get suggestedAbilities(): DomainAction[] {

        if (!this.cellIntend) return [];
        const cellIntend = this.cellIntend;

        return (this.abilityIntend !== null ?
                [this.abilityIntend]
                : (this.adventure.activeUnit?.abilities ?? [])
                    .map(ability => ability.apply(this.adventure))
                    .filter(definedValue)
            )
            .map(ability => ability.apply(cellIntend))
            .filter(definedValue)
        ;
    }

    getDefaultInteraction(cell: Cell): DomainAction|null {

        if (this.abilityIntend) {
            return this.abilityIntend.apply(cell);
        }

        const activeUnit = this.adventure.activeUnit;

        const target = cell.unit;

        if (
            !activeUnit
            || activeUnit === target
            || !this.canAct(activeUnit)
            || activeUnit.cell === null
            || !activeUnit.isCombatReady
        ) {
            return null;
        }

        return activeUnit.abilities
            .filter(ability => ability.descriptor.isStandard)
            .map(action => action.apply(this.adventure))
            .filter(definedValue)
            .map(action => action.apply(cell))
            .filter(definedValue)
            [0] || null
        ;
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
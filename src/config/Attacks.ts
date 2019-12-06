import {AbilityDeclaration, AbilityUse, BoundAbility, contextAgnostic} from "../actions";
import {PlacedUnit} from "../model/IngameUnit";
import {Cell} from "../model/board";
import {canStandardAttack} from "../actions/StandardAttack";

const HeavyStrikeType = {
    name: "Heavy strike",
    isAttack: true,
    isMove: false,
} as const;

export const HeavyStrike: AbilityDeclaration = {
    type: HeavyStrikeType,
    apply: (unit: PlacedUnit): BoundAbility | null => contextAgnostic({
        type: HeavyStrikeType,
        apply(cell: Cell): AbilityUse | null {
            if (!canStandardAttack(unit, cell)) {
                return null;
            }

            return {
                type: HeavyStrikeType,
                apply(): void {
                    cell.unit.dealHealthDamage(2);
                    unit.mainActionUsed = true;
                }
            }
        }
    })
} as const;
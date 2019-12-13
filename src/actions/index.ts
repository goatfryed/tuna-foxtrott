import {Cell} from "../model/board";
import {Adventure} from "../model/Adventure";
import {NotNull} from "../helpers";
import {IngameUnit, PlacedUnit} from "../model/IngameUnit";
import {Path} from "../service/pathfinder";

export interface ActionType<T extends string = string> {
    readonly type: T,
    readonly name: string,
    readonly isStandard?: boolean,
}

type ActionTypeAware<T extends ActionType> = {
    readonly type:T["type"]
    readonly descriptor: T
}

export type Action<T extends ActionType = ActionType> = ActionTypeAware<T> & {
    actor: IngameUnit,
};

export type IngameAbility<A> = A extends Action<infer T > ? ActionTypeAware<T> & {
    adventure: Adventure,
    actor: IngameUnit,
    apply(cell: Cell): A | null
} : never;

export type BoundAbility<A> = A extends Action<infer T > ? ActionTypeAware<T> & {
    actor: IngameUnit,
    apply(adventure: Adventure): IngameAbility<A>| null
} : never;

export type AbilityDeclaration<A> = A extends Action<infer T > ? ActionTypeAware<T> & {
    apply(unit: PlacedUnit): BoundAbility<A> | null
} : never;

export type DomainAction = AttackAction | MigratingAction | MoveAction;
export type DomainAbility = AbilityDeclaration<DomainAction>

export interface MigratingAction extends Action<ActionType<"MIGRATE">> {
    apply(): void,
}

export interface MoveAction extends Action<ActionType<"MOVE">> {
    target: Cell,
    path: Path,
}

export interface AttackType extends ActionType<"ATTACK"> {
    staminaCost: number,
    healthDmg: number,
    staminaDmg: number,
}

export interface AttackAction extends Action<AttackType> {
    target: IngameUnit,
}

export type Attackable = NotNull<Cell, "unit">

export type ExtractActionType<T> = T extends Action<infer S> ? S : never;

export function composeAbility<A extends Action>(
    descriptor: ExtractActionType<A>,
    compose: (unit: PlacedUnit) => (((adventure: Adventure) => (((cell: Cell) => (A | null)) | null)) | null)
): AbilityDeclaration<A> {
    return {
        type: descriptor.type,
        descriptor: descriptor,
        apply: (unit: PlacedUnit) => {
            const ingameActionFactory = compose(unit);
            if (!ingameActionFactory) return null;
            return ({
                type: descriptor.type,
                descriptor: descriptor,
                actor: unit,
                apply: (adventure: Adventure) => {
                    const cellActionFactory = ingameActionFactory(adventure);
                    if (!cellActionFactory) return null;
                    return ({
                        type: descriptor.type,
                        descriptor: descriptor,
                        adventure,
                        actor: unit,
                        apply: cellActionFactory
                    });
                }
            });
        }
    } as unknown as AbilityDeclaration<A>;
}
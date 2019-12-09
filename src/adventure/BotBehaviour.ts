import {Adventure} from "../model/Adventure";
import {NotNull} from "../helpers";
import {IngameUnit, isPlaced, PlacedUnit} from "../model/IngameUnit";
import {computePath, Path} from "../service/pathfinder";
import {Bot} from "../model";
import {reaction} from "mobx";

export function playAggressive(
    adventure: Adventure,
    unitFilter: (unit: IngameUnit) => boolean,
    targetFilter: (unit: IngameUnit) => boolean
) {

    function mayChase(unit: PlacedUnit, target: { path: Path, unit: PlacedUnit }) {
        const currentDistance = unit.cell.getManhattenDistance(target.unit.cell);

        const pathItems = target.path.steps;
        const nextLocation = pathItems.filter(({distance}) => distance < currentDistance)
            .filter(({cost}) => cost <= unit.remainingMovePoints)
            .filter(({cell}) => cell.unit === null)
            .sort(({cost: costA}, {cost: costB}) => costA - costB)
            .sort(({distance: distanceA}, {distance: distanceB}) => distanceA - distanceB)
            [0]
        ;

        if (!nextLocation) {
            return;
        }

        const subSteps = pathItems.slice(0, pathItems.indexOf(nextLocation) + 1);
        const subPath = {
            steps: subSteps,
            cost: subSteps.reduce((prev, current) => prev + current.cost, 0)
        };

        adventure.actionManager.doMoveAction(unit, subPath)();
    }

    function mayAttack(unit: PlacedUnit, target: PlacedUnit) {
        console.log(unit, target);
        if (unit.cell.getManhattenDistance(target.cell) <= 1) {
            const action = adventure.actionManager.attackActionOrNull(unit, target);
            if (action !== null) {
                action();
            }
        }
    }

    function selectTarget(activeUnit: PlacedUnit) {
        const paths = adventure.players
            .flatMap(p => p.units)
            .filter((u): u is NotNull<IngameUnit, "cell"> => u.cell !== null)
            .filter(targetFilter)
            .map(unit => ({
                unit,
                path: computePath(adventure.board, activeUnit, unit.cell, {approachOnly: true})
            }));
        return paths
            .filter(<T extends { path: Path | null }>(target: T): target is T & { path: Path } => target.path !== null)
            .sort((a, b) => a.path.cost - b.path.cost
                || a.unit.currentHealth - b.unit.currentHealth
                || activeUnit.cell.getManhattenDistance(a.unit.cell) - activeUnit.cell.getManhattenDistance(b.unit.cell)
                || a.unit.id - b.unit.id
            )
            [0] || null
            ;
    }

    return (activeUnit: IngameUnit | null) => {
        if (activeUnit === null || !unitFilter(activeUnit)) {
            return;
        }

        if (isPlaced(activeUnit)) {
            const target = selectTarget(activeUnit);

            if (target !== null) {
                mayChase(activeUnit, target);
                mayAttack(activeUnit, target.unit);
            }
        }

        adventure.endTurn();
    };
}

export class ZergBot extends Bot {

    boot(adventure: Adventure): void {
        this.shutdownHandler.push(
            reaction(
                () => adventure.activeUnit,
                playAggressive(
                    adventure,
                    unit => unit.player === this,
                    unit => unit.player !== this && unit.isCombatReady
                )
            )
        );
    }
}
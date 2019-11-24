import {Bot, isPlaced, PlacedUnit, Player, PlayerUnit} from "../model";
import {Adventure} from "../model/Adventure";
import {reaction} from "mobx";
import {createBoard, obstacle} from "../model/board";
import {NotNull} from "../helpers";
import {computePath, Path} from "../actions";

export function createThugTown(user: Player) {
    const board = createBoard(
        5,4,
        [
            {
                terrain: obstacle,
                x: 3, y: 1,
            },
            {
                terrain: obstacle,
                x: 1, y: 2,
            },
            {
                terrain: obstacle,
                x: 4, y: 3,
            }
        ]
    );

    const thugTown = new Adventure(board);
    const thugs = new ThugTownBot("thugs");

    thugTown.players.push(user);
    thugTown.players.push(thugs);

    board.getCell(4,1).unit  = thugs.addUnit({name: "bully", baseHealth: 5, initiativeDelay: 90});
    board.getCell(3,2).unit = thugs.addUnit({name: "thug", baseHealth: 4});

    return thugTown;
}

class ThugTownBot extends Bot {

    boot(adventure: Adventure): void {
        this.shutdownHandler.push(
            reaction(
                () => adventure.activeUnit,
                playAggressive(
                    adventure,
                    unit => unit.player === this,
                    unit => unit.player !== this && unit.isAlive
                )
            )
        );
    }
}

function playAggressive(
    adventure: Adventure,
    unitFilter: (unit: PlayerUnit) => boolean,
    targetFilter: (unit: PlayerUnit) => boolean
) {

    function mayChase(unit: PlacedUnit, target: {path: Path, unit: PlacedUnit}) {
        const currentDistance = unit.cell.getManhattenDistance(target.unit.cell);

        const pathItems = target.path.steps;
        const nextLocation = pathItems.filter(({distance}) => distance < currentDistance)
            .filter(({cost}) => cost <= unit.remainingMovePoints)
            .sort(({cost: costA}, {cost: costB}) => costB - costA)
            [0]
        ;

        if (nextLocation === undefined ) {
            return;
        }

        const subSteps = pathItems.slice(0, pathItems.indexOf(nextLocation) + 1);
        const subPath = {
            steps: subSteps,
            cost: subSteps.reduce((prev, current) => prev + current.cost, 0)
        };

        adventure.actionManager.doMoveAction(unit, subPath).run();
    }

    function mayAttack(unit: PlacedUnit, target: PlacedUnit) {
        console.log(unit, target);
        if (unit.cell.getManhattenDistance(target.cell) <= 1) {
            const action = adventure.actionManager.attackActionOrNull(unit,target);
            if (action !== null) {
                action.run();
            }
        }
    }

    return (activeUnit: PlayerUnit|null) => {
        if (activeUnit === null || !unitFilter(activeUnit) || !isPlaced(activeUnit)) {
            return;
        }

        const cell = activeUnit.cell;
        const possibleTargets = adventure.players
            .flatMap(p => p.units)
            .filter((u): u is NotNull<PlayerUnit, "cell"> => u.cell !== null)
            .filter(targetFilter)
            .sort((a,b) => cell.getManhattenDistance(a.cell) - cell.getManhattenDistance(b.cell))
            .map(unit => ({
                unit,
                path: computePath(adventure.board, activeUnit, unit.cell, {approachOnly: true})
            }))
            .filter(<T extends {path: Path|null}>(target: T): target is T & {path: Path} => target.path !== null)
            .sort((a,b) => a.path.steps.length - b.path.steps.length)
        ;
        const target = possibleTargets[0];

        if (target !== undefined) {
            mayChase(activeUnit, target);
            mayAttack(activeUnit, target.unit);
        }

        adventure.endTurn();
    };
}
import {Cell, PlayerUnit} from "../model";
import {useAdventure, useAppStore} from "../state";
import {useObserver} from "mobx-react-lite";
import React, {useMemo} from "react";
import classNames from "classnames";
import {Adventure} from "../model/Adventure";

interface CellProp {
    cell: Cell,
}

enum Interaction {
    ACTIVE,
    FRIENDLY,
    NEUTRAL,
    ENEMY,
    INTERACTION,
}

function selectAction(appStore: Adventure, unit: PlayerUnit) {
    return () => appStore.activeUnit = unit;
}
function moveAction(activeUnit: PlayerUnit, cell: Cell) {
    return () => activeUnit.cell = cell
}
// noinspection JSUnusedLocalSymbols
function attackAction(activeUnit: PlayerUnit, unit: PlayerUnit) {
    return () => alert("B#m")
}
function clearSelection(appStore: Adventure) {
    return () => appStore.activeUnit = null;
}

export function ControlledCell({cell}: CellProp) {
    const adventure = useAdventure();
    const appStore = useAppStore();

    const interaction = useObserver(
        () => {
            const activeUnit = adventure.activeUnit;

            if (activeUnit === null) {
                if (cell.unit !== null) {
                    return {
                        primary: selectAction(adventure, cell.unit),
                        type: cell.unit.player === appStore.user ? Interaction.FRIENDLY : Interaction.NEUTRAL,
                    };
                }
                return;
            }

            if (activeUnit === cell.unit) {
                return {
                    primary: clearSelection(adventure),
                    type: Interaction.ACTIVE,
                };
            }

            if (activeUnit.player !== appStore.user) {
                if (cell.unit !== null) {
                    return {
                        primary: selectAction(adventure, cell.unit),
                        type: cell.unit.player === appStore.user ? Interaction.FRIENDLY : Interaction.NEUTRAL,
                    };
                }
                return;
            }

            if (cell.unit === null) {
                return {
                    primary: moveAction(activeUnit, cell),
                    type: Interaction.INTERACTION,
                };
            }

            if (cell.unit.player === appStore.user) {
                return {
                    primary: selectAction(adventure, cell.unit),
                    type: Interaction.FRIENDLY,
                };
            }

            // attack?
            return {
                primary: attackAction(activeUnit, cell.unit),
                secondary: selectAction(adventure, cell.unit),
                type: Interaction.ENEMY
            };

        }
    );

    const onClick = useMemo(
        () => interaction && ((event: React.MouseEvent) => {
            event.preventDefault();
            if (event.button == 2 && interaction.secondary) {
                interaction.secondary();
                return;
            }
            interaction.primary();
        }),
        [interaction]
    );

    return <CellView
        cell={cell}
        onClick={onClick}
        type={interaction && interaction.type}
    />
}

interface CellViewProps extends CellProp {
    onClick?: (event: React.MouseEvent) => void,
    type?: Interaction,
}

const mapButtonInteractionToStyle = {
    [Interaction.ACTIVE]: "is-primary",
    [Interaction.INTERACTION]: "is-info",
    [Interaction.FRIENDLY]: "is-success",
    [Interaction.NEUTRAL]: "is-warning",
    [Interaction.ENEMY]: "is-danger",
};

function CellView({cell, onClick, type}: CellViewProps) {

    const cellLabel = useObserver(() => String(cell) + " " + (cell.unit !== null ? cell.unit.toString() : "empty"));
    const className = classNames(
        "cell",
        (type !== undefined) && mapButtonInteractionToStyle[type],
    );

    return <button
        className={className}
        onClick={onClick}
        disabled={onClick === undefined}
        onContextMenu={onClick}
    >
        <span>c1:{cellLabel}</span>
    </button>
}
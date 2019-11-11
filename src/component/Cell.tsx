import {Cell} from "../model";
import {useAdventure, useAppContext} from "../state";
import {useObserver} from "mobx-react-lite";
import React, {useMemo} from "react";
import classNames from "classnames";
import {attackAction, unselectAction, moveAction, selectAction} from "../actions";

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

export function CellPresenter({cell}: CellProp) {
    const adventure = useAdventure();
    const appContext = useAppContext();

    const interaction = useObserver(
        () => {
            const activeUnit = adventure.activeUnit;

            if (activeUnit === null) {
                if (cell.unit !== null) {
                    return {
                        primary: selectAction(adventure, cell.unit),
                        type: cell.unit.player === appContext.user ? Interaction.FRIENDLY : Interaction.NEUTRAL,
                    };
                }
                return;
            }

            if (activeUnit === cell.unit) {
                return {
                    primary: unselectAction(adventure),
                    type: Interaction.ACTIVE,
                };
            }

            if (activeUnit.player !== appContext.user) {
                if (cell.unit !== null) {
                    return {
                        primary: selectAction(adventure, cell.unit),
                        type: cell.unit.player === appContext.user ? Interaction.FRIENDLY : Interaction.NEUTRAL,
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

            const isEnemy = activeUnit.player !== cell.unit.player;

            if (isEnemy && activeUnit.canAttack(cell.unit)) {
                return {
                    primary: attackAction(activeUnit, cell.unit),
                    secondary: selectAction(adventure, cell.unit),
                    type: Interaction.ENEMY
                };
            }

            return {
                primary: selectAction(adventure, cell.unit),
                type: isEnemy ? Interaction.NEUTRAL : Interaction.FRIENDLY,
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

export function CellView({cell, onClick, type}: CellViewProps) {

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
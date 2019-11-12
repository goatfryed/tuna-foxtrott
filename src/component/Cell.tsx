import {Cell} from "../model";
import {useAdventure, useAppContext} from "../state";
import {useObserver} from "mobx-react-lite";
import React, {useCallback} from "react";
import {attackAction, unselectAction, moveAction, selectAction, DomainAction} from "../actions";

interface CellProp {
    cell: Cell,
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
                    };
                }
                return;
            }

            if (activeUnit === cell.unit) {
                return {
                    primary: unselectAction(adventure),
                };
            }

            if (activeUnit.player !== appContext.user) {
                if (cell.unit !== null) {
                    return {
                        primary: selectAction(adventure, cell.unit),
                    };
                }
                return;
            }

            if (cell.unit === null) {
                if (activeUnit.canReach(cell)) {
                    return {
                        primary: moveAction(activeUnit, cell),
                    };
                }
                return;
            }

            const isEnemy = activeUnit.player !== cell.unit.player;

            if (isEnemy && activeUnit.canAttack(cell.unit)) {
                return {
                    primary: attackAction(activeUnit, cell.unit),
                    secondary: selectAction(adventure, cell.unit),
                };
            }

            return {
                primary: selectAction(adventure, cell.unit),
            };


        }
    );

    if (interaction) {
        return <InteractiveCell
            cell={cell}
            {...interaction}
        />
    } else {
        return <CellView cell={cell}/>
    }
}

interface InteractiveCellProps extends CellProp{
    primary: DomainAction,
    secondary?: DomainAction,
}

export function InteractiveCell(props: InteractiveCellProps) {

    const onClick = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();
            if (event.button == 2 && props.secondary) {
                props.secondary.run();
                return;
            }
            props.primary.run();
        },
        [props.primary, props.secondary]
    );

    const interactionStyle = props.primary && deriveInteractionStyle(props);

    return <CellView
        cell={props.cell}
        style={interactionStyle}
        onClick={onClick}
    />
}

interface CellViewProps extends CellProp {
    style?: string,
    onClick?: (event: React.MouseEvent) => any,
    actionLabel?: string
}

export function CellView({style, onClick, cell, actionLabel}: CellViewProps) {
    return useObserver(() => <button
            className={"cell "+ style }
            disabled={onClick === undefined}
            onClick={onClick}
            onContextMenu={onClick}
        >
            <div>
                <div>{String(cell)}</div>
                <div>{cell.unit !== null ? String(cell.unit) : "empty"}</div>
                {actionLabel && <div>{actionLabel}</div>}
            </div>
        </button>
    );
}

function deriveInteractionStyle(props: InteractiveCellProps) {
    return '';
}
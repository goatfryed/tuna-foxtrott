import {AppContext, Cell, PlayerUnit} from "../model";
import {useAdventure, useAppContext} from "../state";
import {useObserver} from "mobx-react-lite";
import React, {useMemo} from "react";
import {Action, ActionType, attackAction, moveAction, selectAction, unselectAction} from "../actions";
import {Adventure} from "../model/Adventure";
import classNames from "classnames";

interface CellProp {
    cell: Cell,
}

function deriveAction(cell: Cell, adventure: Adventure, appContext: AppContext) {
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
    if (!cell.unit.isAlive) {
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

function deriveStyle(cell: Cell, adventure: Adventure, appContext: AppContext, action?: Action) {

    if (adventure.activeUnit && adventure.activeUnit === cell.unit) {
        return "isSelected";
    }

    const styleClasses: any = {};
    if (cell.unit) {
        if (cell.unit.player === appContext.user) {
            styleClasses.friendly = true;
        } else {
            styleClasses.enemy = true;
        }
    }
    if (action && action.type === ActionType.MOVE) {
        styleClasses.canMove = true;
    }
    if (action && action.type === ActionType.ATTACK) {
        styleClasses.canAttack = true;
    }

    return classNames(styleClasses);
}

export function CellPresenter({cell}: CellProp) {
    const adventure = useAdventure();
    const appContext = useAppContext();

    const interaction = useObserver(() => deriveAction(cell, adventure, appContext));
    const stlye = useObserver( () => deriveStyle(cell, adventure, appContext, interaction && interaction.primary));

    const onClick = useMemo(
        () => interaction && ((event: React.MouseEvent) => {
            event.preventDefault();
            if (event.button == 2 && interaction.secondary) {
                interaction.secondary.run();
                return;
            }
            interaction.primary.run();
        }),
        [interaction]
    );

    return <CellView
        cell={cell}
        onClick={onClick}
        style={stlye}
        actionLabel={interaction && actionNameDict[interaction.primary.type]}
    />
}

const actionNameDict: Record<ActionType, string|undefined> = {
    [ActionType.ATTACK]: "attack",
    [ActionType.MOVE]: "move",
    [ActionType.SELECT]: "select",
    [ActionType.UNSELECT]: undefined,
};

interface CellViewProps extends CellProp {
    style?: string,
    onClick?: (event: React.MouseEvent) => any,
    actionLabel?: string
}

type Wanted = 'currentHealth'|'maxHealth';
function CellUnitDetail(props: Pick<PlayerUnit, Wanted> & {description: string} ) {
    return <>
        {props.description + ` (${props.currentHealth}/${props.maxHealth})`}
    </>;
}

export function CellView({style, onClick, cell, actionLabel}: CellViewProps) {
    return useObserver(() => <button
            className={"cell "+ style }
            disabled={onClick === undefined}
            onClick={onClick}
            onContextMenu={onClick}
        >
            <div>
                {cell.unit && <div>
                    <CellUnitDetail
                        currentHealth={cell.unit.currentHealth}
                        maxHealth={cell.unit.maxHealth}
                        description={String(cell.unit)}
                    />
                </div>}
                <div>{String(cell)}</div>
                {actionLabel && <div>{actionLabel}</div>}
            </div>
        </button>
    );
}

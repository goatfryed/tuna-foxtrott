import {AppContext, Cell, PlayerUnit} from "../model";
import {useAdventure, useAppContext} from "../state";
import {useObserver} from "mobx-react-lite";
import React, {useMemo} from "react";
import {Action, ActionType} from "../actions";
import {Adventure} from "../model/Adventure";
import classNames from "classnames";
import {action} from "mobx";

interface CellProp {
    cell: Cell,
}

function deriveStyle(cell: Cell, adventure: Adventure, appContext: AppContext, action: Action|null) {

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

    const {
        activeUnit,
        cellUnit,
        defaultAction,
        style,
    } = useObserver(() => {
        const defaultAction = adventure.actionManager.getDefaultInteraction(cell);
        const style = deriveStyle(cell, adventure, appContext, defaultAction);
        return {
            style,
            defaultAction,
            activeUnit: adventure.activeUnit,
            cellUnit: cell.unit,
        }
    });

    const onClick = useMemo(
        () => {
            if (defaultAction) {
                return action((event: React.MouseEvent) => {
                    event.preventDefault();
                    if (event.button == 2 && activeUnit !== cellUnit) {
                        adventure.activeUnit = cellUnit;
                        return;
                    }
                    defaultAction.run();
                })
            }
            return action(() => {
                adventure.activeUnit = cellUnit;
            })
        },
        [adventure,defaultAction, activeUnit, cellUnit]
    );

    return <CellView
        cell={cell}
        onClick={onClick}
        style={style}
        actionLabel={defaultAction && actionNameDict[defaultAction.type]}
    />
}

const actionNameDict: Record<ActionType, string|null> = {
    [ActionType.ATTACK]: "attack",
    [ActionType.MOVE]: "move",
    [ActionType.SELECT]: "select",
    [ActionType.UNSELECT]: null,
};

interface CellViewProps extends CellProp {
    style?: string,
    onClick?: (event: React.MouseEvent) => any,
    actionLabel: string|null
}

type Wanted = 'currentHealth'|'maxHealth';
function CellUnitDetail(props: Pick<PlayerUnit, Wanted> & {description: string} ) {
    return <>
        {props.description + ` (${props.currentHealth}/${props.maxHealth})`}
    </>;
}

export function CellView({style, onClick, cell, actionLabel}: CellViewProps) {
    return useObserver(() => <div
        title={String(cell)}
        className="cell">
            <button
                className={"content "+ style }
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
                    {actionLabel && <div>{actionLabel}</div>}
                </div>
            </button>
        </div>
    );
}

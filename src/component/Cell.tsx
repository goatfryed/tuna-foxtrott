import {AppContext} from "../model";
import {useAdventure, useAppContext} from "../state";
import {useObserver} from "mobx-react-lite";
import React, {useMemo} from "react";
import {Action, ActionType} from "../actions";
import {Adventure} from "../model/Adventure";
import classNames from "classnames";
import {action} from "mobx";
import {Cell, obstacle} from "../model/board";
import {IngameUnit} from "../model/IngameUnit";
import styled from "styled-components";

interface CellProp {
    cell: Cell,
}

function useInteractionStyle(cell: Cell, adventure: Adventure, appContext: AppContext, action: Action|null) {

    if (adventure.activeUnit && adventure.activeUnit === cell.unit) {
        return "isSelected";
    }

    const styleClasses: string[] = [];
    if (cell.unit) {
        styleClasses.push(cell.unit.player === appContext.user ? "friendly" : "enemy");
    }
    if (action && action.type === ActionType.MOVE) {
        styleClasses.push("canMove");
    }
    if (action === null) {
        styleClasses.push("is-static");
    }
    if (action && action.type === ActionType.ATTACK) {
        styleClasses.push("canAttack");
    }

    return classNames(styleClasses);
}

function useTerrainStyle(cell: Cell) {
    return cell.terrain === obstacle ? "obstacle" : "ground";
}

export function CellPresenter({cell}: CellProp) {
    const adventure = useAdventure();
    const appContext = useAppContext();

    const {
        activeUnit,
        cellUnit,
        defaultAction,
        interactionStyle,
        actionManager,
    } = useObserver(() => {
        const defaultAction = adventure.actionManager.getDefaultInteraction(cell);
        const interactionStyle = useInteractionStyle(cell, adventure, appContext, defaultAction);
        return {
            interactionStyle,
            defaultAction,
            activeUnit: adventure.activeUnit,
            cellUnit: cell.unit,
            actionManager: adventure.actionManager,
        }
    });

    const onClick = useMemo(
        () => {
            if (defaultAction) {
                return action(({}: React.MouseEvent) => {
                    defaultAction.run();
                })
            }
        },
        [adventure,defaultAction, activeUnit, cellUnit]
    );

    const onRightClick = (event: React.MouseEvent) => {
        event.preventDefault();

        actionManager.interactionIntent = {cell};
    };

    return <CellView
        cell={cell}
        onClick={onClick}
        onRightClick={onRightClick}
        style={interactionStyle}
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
    onRightClick?: (event: React.MouseEvent) => any,
    actionLabel: string|null
}

type Wanted = 'currentHealth'|'maxHealth';
function CellUnitDetail(props: Pick<IngameUnit, Wanted> & {description: string} ) {
    return <>
        {props.description + ` (${props.currentHealth}/${props.maxHealth})`}
    </>;
}

const CellContainer = styled.div`
    position: relative;
    overflow: visible;
    width: 5em;
    height: 5em;
    margin: 0.25em;
    
    & > * {
      position: absolute;
      display: flex;
    }
`;

export function CellView({
    style,
    onClick,
    onRightClick,
    cell,
    actionLabel
}: CellViewProps) {

    const terrainStyle = useTerrainStyle(cell);

    return useObserver(() => <CellContainer>
        <div title={String(cell)}
            className="cell">
                <button
                    className={"interaction "+ style }
                    disabled={onClick === undefined}
                    onClick={onClick}
                    onContextMenu={onRightClick}
                >
                    <div className={"content " + terrainStyle}>
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
        </CellContainer>
    );
}

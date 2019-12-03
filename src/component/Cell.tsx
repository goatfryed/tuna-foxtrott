import {AppContext} from "../model";
import {useAdventure, useAppContext} from "../state";
import {useObserver} from "mobx-react-lite";
import React, {useMemo, useState} from "react";
import {Action, ActionType} from "../actions";
import {Adventure} from "../model/Adventure";
import classNames from "classnames";
import {action} from "mobx";
import {Cell, obstacle} from "../model/board";
import {IngameUnit} from "../model/IngameUnit";
import styled from "styled-components";
import {CircleDisplay} from "./Display/CircleDisplay";

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
    } = useObserver(() => {
        const defaultAction = adventure.actionManager.getDefaultInteraction(cell);
        const interactionStyle = useInteractionStyle(cell, adventure, appContext, defaultAction);
        return {
            interactionStyle,
            defaultAction,
            activeUnit: adventure.activeUnit,
            cellUnit: cell.unit,
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

    return <CellView
        cell={cell}
        onClick={onClick}
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
    
    & > * {
      position: absolute;
      display: flex;
    }
`;

function useStableOnBlur(action: () => void, deps?: any[]) {
    return useMemo(() => {
        let scheduled: number|undefined = undefined;
        const onBlur = () => (scheduled = setTimeout(action));
        const onFocus = () => scheduled !== undefined && clearTimeout(scheduled);
        return {onBlur, onFocus}
    }, deps);
}

export function CellView({style, onClick, cell, actionLabel}: CellViewProps) {

    const terrainStyle = useTerrainStyle(cell);

    const adventure = useAdventure();

    const [displaySkillPicker, enableSkillPicker] = useState(false);

    const handleClick = onClick && ((event: React.MouseEvent) => {
        if (event.button === 2) {
            event.preventDefault();
            enableSkillPicker(true);
            return true;
        }
        return onClick(event);
    });

    const {onBlur, onFocus} = useStableOnBlur(() => enableSkillPicker(false), []);

    console.log(adventure.activeUnit);

    return useObserver(() => <CellContainer
            onBlur={onBlur}
            onFocus={onFocus}
        >
        <div title={String(cell)}
            className="cell">
                <button
                    className={"interaction "+ style }
                    disabled={onClick === undefined}
                    onClick={handleClick}
                    onContextMenu={handleClick}
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
        {displaySkillPicker && adventure.activeUnit?.specials && <SkillPicker unit={adventure.activeUnit}/>}
        </CellContainer>
    );
}

const SkillPickerContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  height: 8em;
  width: 8em;
  margin-left: -4em;
  margin-top: -4em;
`;

const Gizmo = styled.button`
    background-color: darkred;
    border-radius: 50%;
    border-color: darkred;
    width: 100%;
    height: 100%;
`;

function SkillPicker({unit}: {unit: IngameUnit}) {
    return <SkillPickerContainer>
        <CircleDisplay circleSize="8em" itemSize="2.5em">
            {unit.specials.map((value, index) => <Gizmo key={index} />)}
        </CircleDisplay>
    </SkillPickerContainer>;
}

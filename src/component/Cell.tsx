import {AppContext} from "../model";
import {useAdventure, useAppContext} from "../state";
import {useObserver} from "mobx-react-lite";
import React, {useMemo} from "react";
import {Action} from "../actions";
import {Adventure} from "../model/Adventure";
import classNames from "classnames";
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
    if (action === null) {
        styleClasses.push("is-static");

    } else if (action.type.isAttack) {
        styleClasses.push("canAttack");

    } else if (action.type.isMove) {
        styleClasses.push("canMove");
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
                return (event: React.MouseEvent) => {
                    if ((event.nativeEvent as any).__keyboardWorkaround === true) {
                        return;
                    }
                    defaultAction.use.apply()
                }
            }
        },
        [adventure,defaultAction, activeUnit, cellUnit]
    );

    const onRightClick = (event: React.MouseEvent) => {
        event.preventDefault();

        actionManager.interactionRequest = {cell};
    };

    return <CellView
        cell={cell}
        onClick={onClick}
        onRightClick={onRightClick}
        style={interactionStyle}
    />
}

interface CellViewProps extends CellProp {
    style?: string,
    onClick?: (event: React.MouseEvent) => any,
    onRightClick?: (event: React.MouseEvent) => any,
}

const HealthBarContainer = styled.div`
  height: fit-content;
  width: 100%;
  padding: 0 0.5em;
  justify-content: center;
`;

function CellUnitDetail(props: {unit: IngameUnit}) {

    const unitLabelStyle = !props.unit.isAlive? "has-text-danger"
        : props.unit.isCombatReady? ""
        : "has-text-warning";

    return useObserver(() => <>
        <HealthBarContainer>
            <HealthBar
                stamina={props.unit.stamina}
                currentHealth={props.unit.currentHealth}
                maxHealth={props.unit.maxHealth}
            />
        </HealthBarContainer>
        <div className={unitLabelStyle}>{String(props.unit)}</div>
    </>);
}

const HealthBarCurrentValue = styled.div<{percentage: number}>`
    width: ${props => props.percentage * 100}%;
    height: 100%;
    border-radius: 0.3em;
`;
const HealthBarHealth = styled(HealthBarCurrentValue)`
    background-color: orange;
`;
const HealthBarStamina = styled(HealthBarCurrentValue)`
    background-color: green;
`;
const HealthBarDmgSection = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: left;
    
    background-color: darkgray;
    flex-grow: 1;
    min-width: 0;
    height: 0.6em;
    border-radius: 0.3em;
`;


function HealthBar(props: {stamina: number, currentHealth: number, maxHealth: number}) {
    if (props.currentHealth <= 0) {
        return <HealthBarDmgSection />
    }

    const relativeHealth = props.currentHealth / props.maxHealth;
    const relativeStamina = props.stamina / props.currentHealth;
    return <HealthBarDmgSection>
        <HealthBarHealth percentage={relativeHealth}>
            <HealthBarStamina percentage={relativeStamina}/>
        </HealthBarHealth>
    </HealthBarDmgSection>
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
                        {cell.unit && <CellUnitDetail unit={cell.unit}/>}
                    </div>
                </button>
            </div>
        </CellContainer>
    );
}

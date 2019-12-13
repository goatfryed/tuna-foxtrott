import styled from "styled-components";
import {useAdventure} from "../state";
import {useObserver} from "mobx-react-lite";
import React, {ReactNode} from "react";
import {DomainAction, ExtractActionType, IngameAbility} from "../actions";
import {button} from "@storybook/addon-knobs";
import {Runnable} from "../Utility";

function ActionBarButton(props: { ability: IngameAbility<DomainAction> }) {
    const adventure = useAdventure();
    const {
        isSelected
    } = useObserver(() => ({
        isSelected: adventure.actionManager.abilityIntend === props.ability
    }));
    const onClick = isSelected ?
        () => adventure.actionManager.abilityIntend = null
        : () => adventure.actionManager.abilityIntend = props.ability;


    const style = isSelected ? "is-primary" : undefined;

    return <ActionButton onClick={onClick} action={props.ability.descriptor} style={style} />;
}

export function ActionButton(props: {action: ExtractActionType<DomainAction>, onClick?: Runnable, style?: string}) {
    let className = "button";
    if (props.style) className = className + " " + props.style;

    let detail: ReactNode = null;
    if (props.action.type === "ATTACK") {
        detail = " - Cost: " + props.action.staminaCost;
    }

    return <button
        className={className}
        onClick={props.onClick}
    >{props.action.name}{detail}</button>
}

const ActionSideBarRight = styled.div`
    height: 100%;
    width: fit-content;
    
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-start;
`;
export const ActionLogSideBar = styled(ActionSideBarRight)`
    align-items: flex-start;
    height: 50vh;
    overflow-y: auto;
`;

export function ActionBar() {
    const adventure = useAdventure();
    return useObserver(() => <ActionSideBarRight>{adventure.actionManager
        .abilities
        .filter(ability => !ability.descriptor.isStandard)
        .map(ability => <ActionBarButton key={ability.descriptor.name}
                                         ability={ability}
            />
        )}</ActionSideBarRight>
    );
}
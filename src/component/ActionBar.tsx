import styled from "styled-components";
import {useAdventure} from "../state";
import {useObserver} from "mobx-react-lite";
import React from "react";
import {IngameAbility} from "../actions";
import classNames from "classnames";
import {button} from "@storybook/addon-knobs";

function ActionBarButton(props: { ability: IngameAbility }) {
    const adventure = useAdventure();
    const {
        isSelected
    } = useObserver(() => ({
        isSelected: adventure.actionManager.abilityIntend === props.ability
    }));
    const onClick = isSelected ?
        () => adventure.actionManager.abilityIntend = null
        : () => adventure.actionManager.abilityIntend = props.ability;


    const className = classNames("button", {"is-primary": isSelected});

    return <button className={className} onClick={onClick}>{props.ability.type.name}</button>;
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
        .filter(ability => !ability.type.isStandard)
        .map(ability => <ActionBarButton key={ability.type.name}
                                         ability={ability}
            />
        )}</ActionSideBarRight>
    );
}
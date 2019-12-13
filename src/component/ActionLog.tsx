import {useAdventure} from "../state";
import {useObserver} from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import {Immutable} from "../helpers";
import {DomainAction} from "../actions";

export function ActionLog() {
    const adventure = useAdventure();
    console.log(adventure.actionLog);
    return <>{useObserver(() => adventure.actionLog
        .map(
            value => <ActionLogItem key={value.id} action={value.action}/>
        )
    )}</>
}

const ActionLogItemContainer = styled.div`
  min-width: 6em;
  height: 3ex;
`;

function ActionLogItem(props: { action: Immutable<DomainAction> }) {
    return <ActionLogItemContainer>
        {"actor" in props.action ? props.action.actor.name : "Unknown"}: {props.action.descriptor.name}
    </ActionLogItemContainer>
}
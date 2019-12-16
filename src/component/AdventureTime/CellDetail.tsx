import {useActionManager, useAdventure} from "../../state";
import {useObserver} from "mobx-react-lite";
import {HeroTilePresenter} from "../Roster";
import React from "react";
import styled from "styled-components";

export const CellDetailContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12em;
  height: 12ex;
`;

export function CellDetail() {
    const adventure = useAdventure();
    const actionManager = useActionManager();
    const displayUnit = useObserver(() => actionManager.hoveredCell?.unit || adventure.activeUnit);

    if (!displayUnit) return null;

    return <HeroTilePresenter
        unit={displayUnit}
        isPrimary={adventure.activeUnit === displayUnit}
    />
}
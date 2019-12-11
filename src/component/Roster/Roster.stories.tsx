import * as React from "react";
import {RosterBrowser, HeroEntry} from "./index";
import {observable} from "mobx";
import styled from "styled-components";
import {CornerBorders} from "../Display/CornerBorders";
import {action} from "@storybook/addon-actions";
import {axelBase, bowerBase} from "../../fixtures";
import {UnitSelectionModel} from "../AdventureSelection";

const Boxed = styled(CornerBorders)`
    margin: 2em;
`;

// noinspection JSUnusedGlobalSymbols
export default {
    title: "Roster",
    decorators: [(Story: any) => <Boxed><Story/></Boxed>],
}

const selectionModel: UnitSelectionModel = {
    [bowerBase.id]: {
        isSelected: false,
        unit: bowerBase,
    },
    [axelBase.id]: {
        isSelected: true,
        unit: axelBase,
    }
};
observable([
    axelBase,
    bowerBase,
]);
export function browser() {
    return <RosterBrowser
        onSelectionUpdate={action("onSelectionUpdate")}
        selectionModel={selectionModel}
    />
}

// noinspection JSUnusedGlobalSymbols
export function hero() {
    return <HeroEntry
        item={selectionModel[bowerBase.id]}
        onSelection={action("onSelection")}
    />
}


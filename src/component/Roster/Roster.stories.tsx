import * as React from "react";
import {RosterBrowser, HeroEntry} from "./index";
import {observable} from "mobx";
import styled from "styled-components";
import {CornerBorders} from "../Display/CornerBorders";
import {action} from "@storybook/addon-actions";
import {axelBase, bowerBase} from "../../fixtures";
import {UnitSelectionModel} from "../AdventureSelection";
import {Player} from "../../model";

const Boxed = styled(CornerBorders)`
    margin: 2em;
`;

// noinspection JSUnusedGlobalSymbols
export default {
    title: "Roster",
    decorators: [(Story: any) => <Boxed><Story/></Boxed>],
}

const user = new Player("karli");
const bower = user.addUnit(bowerBase);
const axel = user.addUnit(axelBase);

const selectionModel: UnitSelectionModel = {
    [bower.id]: {
        isSelected: false,
        unit: bower,
    },
    [axel.id]: {
        isSelected: true,
        unit: axel,
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
        item={selectionModel[bower.id]}
        onSelection={action("onSelection")}
    />
}


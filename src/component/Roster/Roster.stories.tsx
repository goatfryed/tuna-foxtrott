import * as React from "react";
import {RosterBrowser, RosterManager, HeroEntry} from "./index";
import {observable} from "mobx";
import styled from "styled-components";
import {CornerBorders} from "../Display/CornerBorders";
import {action} from "@storybook/addon-actions";
import {AppContextProvider} from "../../state";
import {AppContext, Player} from "../../model";
import {axelBase, bowerBase} from "../../fixtures";

const Boxed = styled(CornerBorders)`
    margin: 2em;
`;

export default {
    title: "Roster",
    decorators: [(Story: any) => <Boxed><Story/></Boxed>],
}

export function manager() {
    const context = new AppContext(new Player("Dave"));
    return <AppContextProvider context={context}>
        <RosterManager navigator={action("navigation")}/>
    </AppContextProvider>
}

const roster = observable([
    axelBase,
    bowerBase,
]);

export function browser() {
    return <RosterBrowser roster={roster}/>
}

export function hero() {
    return <HeroEntry
        hero={{
            id: 0,
            name: "Dave",
            baseHealth: 3,
            baseSpeed: 3,
            initiativeDelay: 100,
        }}
    />
}


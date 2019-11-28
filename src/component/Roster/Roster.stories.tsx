import * as React from "react";
import {RosterBrowser, RosterManager, HeroEntry} from "./index";
import {observable} from "mobx";
import styled from "styled-components";
import {CornerBorders} from "../Highlighting/CornerBorders";
import {action} from "@storybook/addon-actions";
import {AppContextProvider} from "../../state";
import {AppContext, Player} from "../../model";

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
    {
        name: "Axel",
        baseHealth: 6,
    },
    {
        name: "Bower",
        baseHealth: 3,
    },
]);

export function browser() {
    return <RosterBrowser roster={roster}/>
}

export function hero() {
    return <HeroEntry
        hero={{
            name: "Dave",
            baseHealth: 3,
        }}
    />
}


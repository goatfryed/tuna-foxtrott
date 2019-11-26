import * as React from "react";
import {RosterBrowser, RosterManager} from "./index";
import {observable} from "mobx";
import styled from "styled-components";

const Boxed = styled.div`
    border-color: black;
    border-style: dashed;
    border-width: 2px;
    margin: 2em;
`;

export default {
    title: "Roster",
    decorators: [(Story: any) => <Boxed><Story/></Boxed>],
}

export function manager() {
    return <RosterManager />
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


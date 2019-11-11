import {AdventureAware} from "../model/Adventure";
import {useObserver} from "mobx-react-lite";
import {AdventureProvider} from "../state";
import {Board} from "./Board";
import React from "react";

export function AdventureView({adventure, onSurrender}: AdventureAware & { onSurrender: () => any }) {
    const selectionLabel = useObserver(
        () => adventure.activeUnit !== null ? adventure.activeUnit.toString() : "Click on any hero to select him",
    );

    return <AdventureProvider adventure={adventure}>
        <div><span>Selection: {selectionLabel}</span></div>
        <hr/>
        <Board/>
        <hr/>
        <button className="button is-danger" onClick={onSurrender}>Surrender</button>
    </AdventureProvider>
}
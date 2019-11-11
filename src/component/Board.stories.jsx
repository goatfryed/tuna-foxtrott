import {Board} from "./Board";
import {Adventure} from "../model/Adventure";
import {createBoard} from "../model";
import React from "react";
import {AdventureProvider, AppContextProvider} from "../state";

import "../app.scss";

export default {
    title: "Board"
}

const board = (() => {
    return createBoard(4,4);
})();

function newAdventure(localBoard = board) {
    return new Adventure(localBoard);
}

export function standard() {
    return <AppContextProvider>
        <AdventureProvider adventure={newAdventure()}>
            <Board />
        </AdventureProvider>
    </AppContextProvider>
}
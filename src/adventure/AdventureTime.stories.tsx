import {AdventureView} from "../component/AdventureTime";
import React from "react";
import {AppContextProvider} from "../state";
import {createThugTown} from "./ThugTown";
import {action} from "@storybook/addon-actions";
import {boolean, select, withKnobs} from "@storybook/addon-knobs";
import {useMemo} from "@storybook/addons";
import {createBoard, OBSTACLE} from "../model/board";
import {Adventure} from "../model/Adventure";
import {axelBase, bowerBase, clubberBase, exampleContext, exampleUserPlayer, macelBase} from "../fixtures";
import {createMoshPit} from "./MoshPit";

// noinspection JSUnusedGlobalSymbols
export default {
    title: "Adventuring",
    component: AdventureView,
    decorators: [
        withKnobs,
    ],
    parameters: {
        enableShortcuts: false,
    },
}

// noinspection JSUnusedGlobalSymbols
export function gameOver() {
    const context = exampleContext;

    const board = useMemo(() => createBoard(2,2, [{x: 1, y: 1, terrain: OBSTACLE}]));
    const gameState = select("victoryState",
        [
            "won",
            "lost",
            "undecided",
        ],
        "won",
    );

    class GameOverAdventure extends Adventure {
        constructor() {
            super(exampleUserPlayer,board);
        }


        isWon(): boolean {
            return gameState === "won";
        }

        isLost(): boolean {
            return gameState === "lost";
        }
    }

    const adventure = new GameOverAdventure();

    return <AppContextProvider context={context}><AdventureView
        adventure={adventure}
        onSurrender={action("onSurrender")}
        onDefeat={action("onDefeat")}
        onVictory={action("onVictory")}
        isIsometric={false}
    /></AppContextProvider>
}

// noinspection JSUnusedGlobalSymbols
export function thugTown() {
    const context = exampleContext;

    const thugTownAdventure = useMemo(
        () =>
            createThugTown(context.user, [clubberBase, axelBase, bowerBase]),
        [context]
    );

    return <AppContextProvider context={context}><AdventureView
        adventure={thugTownAdventure}
        onSurrender={action("onSurrender")}
        onDefeat={action("onDefeat")}
        onVictory={action("onVictory")}
        isIsometric={boolean("Isometric", false)}
    /></AppContextProvider>
}

// noinspection JSUnusedGlobalSymbols
export function moshPit() {
    const context = exampleContext;

    const thugTownAdventure = useMemo(
        () =>
            createMoshPit(context.user, [clubberBase, axelBase, bowerBase, macelBase]),
        [context]
    );

    return <AppContextProvider context={context}><AdventureView
        adventure={thugTownAdventure}
        onSurrender={action("onSurrender")}
        onDefeat={action("onDefeat")}
        onVictory={action("onVictory")}
        isIsometric={boolean("Isometric", false)}
    /></AppContextProvider>
}
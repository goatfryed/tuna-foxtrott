import {AdventureView} from "./AdventureTime";
import React from "react";
import {AppContextProvider} from "../state";
import {AppContext, Player} from "../model";
import {createThugTown} from "../adventure/ThugTown";
import {action} from "@storybook/addon-actions";
import {boolean, select, withKnobs} from "@storybook/addon-knobs";
import {useMemo} from "@storybook/addons";
import {createBoard, obstacle} from "../model/board";
import {Adventure} from "../model/Adventure";
import {axelBase, bowerBase, clubberBase, macelBase} from "../fixtures";

function createStoryContext() {
    const user = new Player("Karli");
    return {
        user,
        axel: user.addUnit(axelBase),
        bower: user.addUnit(bowerBase),
        macel: user.addUnit(macelBase),
        appContext: new AppContext(user)
    }
}

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

export function gameOver() {
    const context = createStoryContext();

    const board = useMemo(() => createBoard(2,2, [{x: 1, y: 1, terrain: obstacle}]));
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
            super(board);
        }


        isWonBy(user: Player): boolean {
            return gameState === "won";
        }

        isLostBy(player: Player): boolean {
            return gameState === "lost";
        }
    }

    const adventure = new GameOverAdventure();

    return <AppContextProvider context={context.appContext}><AdventureView
        adventure={adventure}
        onSurrender={action("onSurrender")}
        onDefeat={action("onDefeat")}
        onVictory={action("onVictory")}
        isIsometric={false}
    /></AppContextProvider>
}

export function thugTown() {
    const context = createStoryContext();

    const thugTownAdventure = useMemo(
        () => {
            const clubber = context.user.addUnit( clubberBase);
            const heroes = context.user.units.slice(0,2).concat([clubber]);
            return createThugTown(context.user, heroes);
        },
        [context]
    );

    return <AppContextProvider context={context.appContext}><AdventureView
        adventure={thugTownAdventure}
        onSurrender={action("onSurrender")}
        onDefeat={action("onDefeat")}
        onVictory={action("onVictory")}
        isIsometric={boolean("Isometric", false)}
    /></AppContextProvider>
}
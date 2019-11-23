import {AdventureView} from "./AdventureTime";
import React from "react";
import {AppContextProvider} from "../state";
import {AppContext, Player} from "../model";
import {createThugTown} from "../adventure/ThugTown";
import {action} from "@storybook/addon-actions";
import {boolean, button, select, withKnobs} from "@storybook/addon-knobs";
import {useMemo} from "@storybook/addons";
import {createBoard, obstacle} from "../model/board";
import {Adventure} from "../model/Adventure";

function createStoryContext() {
    const user = new Player("Karli");
    return {
        user,
        axel: user.addUnit({name: "axel", baseHealth: 5, initiativeDelay: 80}),
        bower: user.addUnit({name: "bower", baseSpeed: 2, baseHealth: 4}),
        macel: user.addUnit({name: "macel", baseHealth: 6, initiativeDelay: 105}),
        appContext: new AppContext(user)
    }
}

export default {
    title: "Adventuring",
    component: AdventureView,
    decorators: [
        withKnobs,
        (Story: any) => {
            button("Refresh", () => {});
            return <Story />
        },
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
            const adventure = createThugTown(context.user);
            const clubber = context.user.addUnit( {name: "clubber", baseHealth: 5, initiativeDelay: 80});
            context.user.units.forEach(u => adventure.heroes.push(u));
            context.axel.cell = adventure.board.getCell(0,0);
            context.bower.cell = adventure.board.getCell(3,3);
            context.macel.cell = adventure.board.getCell(0,2);
            clubber.cell = adventure.board.getCell(4,0);

            return adventure;
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
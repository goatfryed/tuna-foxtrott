import {AdventureView} from "./AdventureTime";
import React from "react";
import {AppContextProvider} from "../state";
import {AppContext, Player} from "../model";
import {createThugTown} from "../adventure/ThugTown";
import {action} from "@storybook/addon-actions";
import {boolean, button, withKnobs} from "@storybook/addon-knobs";
import {useMemo} from "@storybook/addons";

function createStoryContext() {
    const user = new Player("Karli");
    return {
        user,
        axel: user.addUnit({name: "axel", baseHealth: 5, initiative: 80}),
        bower: user.addUnit({name: "bower", baseSpeed: 2, baseHealth: 4}),
        macel: user.addUnit({name: "macel", baseHealth: 6, initiative: 105}),
        appContext: new AppContext(user)
    }
}

export default {
    title: "Adventuring",
    component: AdventureView,
    decorators: [
        withKnobs,
        Story => {
            button("Refresh", () => {});
            return <Story />
        },
    ],
    parameters: {
        enableShortcuts: false,
    },
}

export function thugTown() {
    const context = createStoryContext();

    const thugTownAdventure = useMemo(
        () => {
            const adventure = createThugTown(context.user);
            const clubber = context.user.addUnit( {name: "clubber", baseHealth: 5, initiative: 80});
            context.user.units.forEach(u => adventure.heroes.push(u));
            context.axel.cell = adventure.board[0][0];
            context.bower.cell = adventure.board[3][3];
            context.macel.cell = adventure.board[2][0];
            clubber.cell = adventure.board[0][5];
            adventure.activeUnit = context.axel;

            return adventure;
        },
        [context]
    );

    return <AppContextProvider context={context.appContext}><AdventureView
        adventure={thugTownAdventure}
        onSurrender={action("onSurrender")}
        isIsometric={boolean("Isometric", false)}
    /></AppContextProvider>
}
import {AdventureSelection} from "./AdventureSelection";
import {withKnobs} from "@storybook/addon-knobs";
import {action} from "@storybook/addon-actions";
import * as React from "react";
import {AppContextProvider} from "../state";
import {defaultContext} from "../fixtures";

// noinspection JSUnusedGlobalSymbols
export default {
    title: "Adventure Selection",
    component: AdventureSelection,
    decorators: [
        withKnobs,
    ],
    parameters: {
        enableShortcuts: false,
    }
} as const;

export function main() {
    return <AppContextProvider context={defaultContext}>
        <AdventureSelection
            onAdventureSelected={action("onAdventureSelected")}
        />
    </AppContextProvider>
}
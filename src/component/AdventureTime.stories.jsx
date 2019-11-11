import {AdventureView} from "./AdventureTime";
import React from "react";
import {AppContextProvider} from "../state";

export default {
    title: "Adventuring",
    component: AdventureView,
    decorators: [
        (story) => <AppContextProvider>
            <hr/>
            {story()}
        </AppContextProvider>,
    ],
}

export function thugTown() {
    return "hi";
}
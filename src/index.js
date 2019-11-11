import React from "react";
import {render} from "react-dom";

import "./app.scss";
import {AppContextProvider} from "./state";
import {App} from "./App";

function renderApp () {
    render(
        <AppContextProvider>
            <App/>
        </AppContextProvider>,
        document.getElementById("app")
    );
}

renderApp();

// noinspection JSUnresolvedVariable
if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept(() => { renderApp() });
}
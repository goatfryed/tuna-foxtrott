import React, {useCallback, useState} from "react";
import {useObserver} from "mobx-react-lite";
import {Board} from "./component/Board";
import {AdventureAware, Adventure} from "./model/Adventure";
import {AdventureSelection} from "./component/AdventureSelection";
import {AdventureProvider} from "./state";

export function App() {
    const [adventure, setAdventure] = useState<Adventure|null>(null);

    const handleSurrender = useCallback(
        () => window.confirm("Sure, Dude?") && setAdventure(null), []
    );

    return <section className="section">
        <div className="container">
            <div>🌹</div>
            {adventure === null ?
                <AdventureSelection onAdventureSelected={adventure => setAdventure(adventure)}/>
                : <AdventureView
                    adventure={adventure}
                    onSurrender={handleSurrender}
                />
            }
        </div>
    </section>
}

function AdventureView({adventure, onSurrender}: AdventureAware & {onSurrender: () => any}) {
    const selectionLabel = useObserver(
        () => adventure.activeUnit !== null ? adventure.activeUnit.toString() : "Click on any hero to select him",
    );

    return <AdventureProvider adventure={adventure}>
        <div><span>Selection: {selectionLabel}</span></div>
        <hr/>
        <Board adventure={adventure} />
        <hr/>
        <button className="button is-danger" onClick={onSurrender}>Surrender </button>
    </AdventureProvider>
}
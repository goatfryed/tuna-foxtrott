import React, {useCallback, useState} from "react";
import {Adventure} from "./model/Adventure";
import {AdventureSelection} from "./component/AdventureSelection";
import {AdventureView} from "./component/AdventureTime";
import {useAppContext} from "./state";
import {RosterManager} from "./component/Roster";

export function Home(props: {onAdventureSelected: (a: Adventure) => void}) {
    const appContext = useAppContext();
    const defaultScreen = appContext.user.units.length === 0 ? "Roster" : "Adventures";
    const [screen, setScreen] = useState<"Adventures"|"Roster"|string>(defaultScreen);

    if (screen === "Roster") {
        return <RosterManager navigator={setScreen}/>
    }
    return <AdventureSelection
        navigator={setScreen}
        onAdventureSelected={props.onAdventureSelected}
    />
}

export function App() {
    const [adventure, setAdventure] = useState<Adventure|null>(null);

    const handleSurrender = useCallback(
        () => window.confirm("Sure, Dude?") && setAdventure(null), []
    );

    return <section className="section">
        <div className="container">
            <div>🌹</div>
            {adventure === null ?
                <Home onAdventureSelected={setAdventure} />
                : <AdventureView
                    adventure={adventure}
                    onSurrender={handleSurrender}
                    onVictory={() => setAdventure(null)}
                    onDefeat={() => setAdventure(null)}
                />
            }
        </div>
    </section>
}


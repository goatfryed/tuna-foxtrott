import React, {useCallback, useState} from "react";
import {Adventure} from "./model/Adventure";
import {AdventureSelection} from "./component/AdventureSelection";
import {AdventureView} from "./component/AdventureTime";

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


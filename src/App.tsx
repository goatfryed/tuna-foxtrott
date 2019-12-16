import React, {useCallback, useMemo, useState} from "react";
import {Adventure} from "./model/Adventure";
import {AdventureSelection, useUnitSelectionModel} from "./component/AdventureSelection";
import {AdventureView} from "./component/AdventureTime/AdventureTime";
import {useAppContext} from "./state";
import {RosterManager} from "./component/Roster";
import {AdventureDescription} from "./adventure";

export function Home(props: {onAdventureSelected: (a: Adventure) => void}) {
    const appContext = useAppContext();

    const {
        unitSelectionModel,
        toggleItem
    } = useUnitSelectionModel();

    const [selectedAdventure, selectAdventure] = useState<AdventureDescription>();

    const selectedUnits = useMemo(() => Object.values(unitSelectionModel)
            .filter(({isSelected}) => isSelected)
            .map(({unit}) => unit),
        [unitSelectionModel]
    );

    const user = appContext.user;
    const startAdventure = useMemo(
        () => {
            if (!selectedAdventure || selectedUnits.length === 0) {
                return;
            }
            return () => {
                props.onAdventureSelected(selectedAdventure.factory(user, selectedUnits))
            }
        },
        [selectedUnits, selectedAdventure, user]
    );

    return <>
        <RosterManager onSelectionUpdate={toggleItem} selectionModel={unitSelectionModel} />
        <hr />
        <AdventureSelection
            onAdventureSelected={selectAdventure}
            selectedAdventure={selectedAdventure}
        />
        <hr/>
        <div>
            <button className="button" disabled={!startAdventure} onClick={startAdventure}>Start adventure</button>
        </div>
    </>
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


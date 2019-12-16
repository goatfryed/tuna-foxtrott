import React, {useCallback, useMemo, useState} from "react";
import {Adventure, GameSummary} from "App/model/Adventure";
import {AdventureSelection, useUnitSelectionModel} from "./component/AdventureSelection";
import {AdventureView} from "./component/AdventureTime/AdventureTime";
import {useAppContext} from "./state";
import {RosterManager} from "App/component/Roster";
import {adventureDescriptions, TrackedAdventure} from "./adventure";


export function Home(props: {
    onAdventureSelected: (a: {adventure: TrackedAdventure, game: Adventure }) => void
    adventures: TrackedAdventure[],
}) {
    const appContext = useAppContext();

    const {
        unitSelectionModel,
        toggleItem
    } = useUnitSelectionModel();
    const [selectedAdventure, selectAdventure] = useState<TrackedAdventure>();

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
                props.onAdventureSelected({
                    adventure: selectedAdventure,
                    game: selectedAdventure.description.factory(user, selectedUnits),
                })
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
            adventures={props.adventures}
        />
        <hr/>
        <div>
            <button className="button" disabled={!startAdventure} onClick={startAdventure}>Start adventure</button>
        </div>
    </>
}

function createCampaignModel() {
    return adventureDescriptions.map(def => new TrackedAdventure(def));
}
export function useCampaignModel() {
    return useMemo(createCampaignModel, []);
}


export function App() {
    const [selection, setSelection] = useState<{adventure: TrackedAdventure, game: Adventure}>();

    const handleSurrender = useCallback(
        () => window.confirm("Sure, Dude?") && setSelection(undefined), []
    );

    const adventures = useCampaignModel();

    function onGameFinished(summary: GameSummary) {
        console.log(summary);
        if (!selection) return;
        selection.adventure.summary = summary;
        setSelection(undefined);
    }

    return <section className="section">
        <div className="container">
            <div>🌹</div>
            {selection === undefined ?
                <Home onAdventureSelected={setSelection}
                      adventures={adventures}
                />
                : <AdventureView
                    adventure={selection.game}
                    onSurrender={handleSurrender}
                    onVictory={onGameFinished}
                    onDefeat={onGameFinished}
                />
            }
        </div>
    </section>
}


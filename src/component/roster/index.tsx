import * as React from "react";
import {observable} from "mobx";
import {UnitDefinition} from "../../model";
import {useMemo} from "react";

const defaultRoster = newRoster();

export const RosterContext = React.createContext(defaultRoster);

function newRoster() {
    return observable<UnitDefinition>([]);
}

export function RosterManager() {

    const roster = useMemo(() => newRoster(), []);
    return <RosterContext.Provider value={roster}>
        <div className="container">
            <div>🐱‍🚀🐱‍👓🐱‍👤</div>
            <hr/>
            <div>Your Roster</div>
            <hr/>
            <button className="button" disabled>Hire hero</button>
        </div>
    </RosterContext.Provider>
}
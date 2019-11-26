import * as React from "react";
import {IObservableArray, observable} from "mobx";
import {useObserver} from "mobx-react";
import {UnitDefinition} from "../../model";
import {useMemo} from "react";

const defaultRoster = newRoster();

export const RosterContext = React.createContext(defaultRoster);

function newRoster() {
    return observable<UnitDefinition>([]);
}

export function RosterManager() {

    const roster = useMemo(() => newRoster(), []);
    return <div className="container">
        <div>🐱‍🚀🐱‍👓🐱‍👤</div>
        <hr/>
        <div>
            <RosterBrowser roster={roster} />
        </div>
        <hr/>
        <button className="button is-success" disabled>Hire hero</button>
    </div>
}

export function RosterBrowser(props: { roster: IObservableArray<UnitDefinition> }) {
    return useObserver(() => <div>
        {props.roster.map( u => <p>{u.name}</p>)}
    </div>);
}
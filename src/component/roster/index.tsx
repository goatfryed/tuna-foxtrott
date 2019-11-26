import * as React from "react";
import {IObservableArray, observable} from "mobx";
import {useObserver} from "mobx-react";
import {UnitDefinition} from "../../model";
import {useMemo} from "react";
import styled, {css} from "styled-components";

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

const Container = styled.div`
    padding: 0.5em;
    border-style: solid;
`;

export function RosterBrowser(props: { roster: IObservableArray<UnitDefinition> }) {
    return useObserver(() => <Container>
        {props.roster.map( u => <RosterEntry hero={u} />)}
    </Container>);
}

const darkHover = css`
    &:hover {
        filter: brightness(0.85);
    }
`;

const HeroTile = styled.div`
    margin: 0.5em;
    padding: 0.5em;
    max-width: 24ex;
    background-color: rgb(150, 232, 158);
    border-color: rgb(126, 183, 131);
    border-width: 0 3px 3px 0;
    border-style: solid;
    border-radius: 0.3em;
    ${darkHover}
`;

const Line = styled.hr`
    margin: 0 0 0.5em 0;
`;

export function RosterEntry(props: {hero: UnitDefinition}) {
    return <HeroTile>
        {props.hero.name}
        <Line />
        ❤ {props.hero.baseHealth} - 👣 {props.hero.baseSpeed} - 🚄 - {props.hero.initiativeDelay}
    </HeroTile>
}
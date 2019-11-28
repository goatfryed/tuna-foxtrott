import * as React from "react";
import {useMemo} from "react";
import {IObservableArray, observable} from "mobx";
import {useObserver} from "mobx-react";
import {UnitDefinition} from "../../model";
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
    display: flex;
    flex-flow: row;
    justify-content: center;
    align-items: center;
`;

export function RosterBrowser(props: { roster: IObservableArray<UnitDefinition> }) {
    return useObserver(() => <Container>
        {props.roster.map( u => <HeroEntry hero={u} />)}
    </Container>);
}

const darkHover = css`
    &:hover {
        filter: brightness(1.15);
    }
`;

const HeroTile = styled.div`
    margin: 0.5em;
    padding: 0.5em;
    max-width: 24ex;
    flex-grow: 1;
    background-color: rgb(121,200,126);
    border-color: rgb(117,175,122);
    border-width: 0 3px 3px 0;
    border-style: solid;
    border-radius: 0.3em;
    ${darkHover}
`;

const Line = styled.hr`
    margin: 0 0 0.5em 0;
`;

export function HeroEntry(props: {hero: UnitDefinition}) {
    return <HeroTile>
        {props.hero.name}
        <Line />
        ❤ {props.hero.baseHealth} - 👣 {props.hero.baseSpeed} - 🚄 {props.hero.initiativeDelay}
    </HeroTile>
}


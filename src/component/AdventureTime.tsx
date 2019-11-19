import {AdventureAware} from "../model/Adventure";
import {useObserver} from "mobx-react-lite";
import {AdventureProvider, useAppContext} from "../state";
import {Board} from "./Board";
import React, {useCallback, useEffect} from "react";
import {HeroAware, HeroDetail} from "./Hero";

export function AdventureView({adventure, isIsometric, onSurrender}: AdventureAware & { onSurrender: () => any, isIsometric?: boolean}) {

    const context = useAppContext();

    useEffect(
        () => {
            adventure.currentPlayer = context.user;
        },
        [adventure]
    );

    return <AdventureProvider adventure={adventure}>
        <div className="container">
            <hr/>
            <div className="columns">
                <div className="column">
                    <div className="buttons">
                        {adventure.heroes.map(hero => <LocalHeroDetail
                            key={hero.id}
                            adventure={adventure}
                            hero={hero}
                        />)}
                    </div>
                </div>
                <div className="column has-text-right">
                    <button className="button is-warning" onClick={() => adventure.endTurn()}>End turn</button>
                    <button className="button is-danger" onClick={onSurrender}>Surrender</button>
                </div>
            </div>
            <hr/>
            <Board isIsometric={isIsometric}/>
            <hr/>
        </div>
    </AdventureProvider>
}

function LocalHeroDetail({hero, adventure}: HeroAware & AdventureAware) {
    const heroIsActive = useObserver(() => adventure.activeUnit === hero);
    const handleClick = useCallback(
        () => {
            if (!heroIsActive) adventure.activeUnit = hero;
        },
        [hero, adventure, heroIsActive]
    );

    const style = heroIsActive ? "is-primary" : "is-info";

    return <HeroDetail onClick={handleClick} hero={hero} style={style}/>
}
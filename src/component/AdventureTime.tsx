import {AdventureAware} from "../model/Adventure";
import {useObserver} from "mobx-react-lite";
import {AdventureProvider} from "../state";
import {Board} from "./Board";
import React, {useMemo} from "react";
import {HeroAware, HeroDetail} from "./Hero";
import {selectAction, unselectAction} from "../actions";

export function AdventureView({adventure, isIsometric, onSurrender}: AdventureAware & { onSurrender: () => any, isIsometric?: boolean}) {
    return <AdventureProvider adventure={adventure}>
        <div className="container">
            <hr/>
            <div className="buttons">
                {adventure.heroes.map(hero => <LocalHeroDetail
                    key={hero.id}
                    adventure={adventure}
                    hero={hero}
                />)}
            </div>
            <hr/>
            <Board isIsometric={isIsometric}/>
            <hr/>
            <button className="button is-danger" onClick={onSurrender}>Surrender</button>
        </div>
    </AdventureProvider>
}

function LocalHeroDetail({hero, adventure}: HeroAware & AdventureAware) {
    const heroIsActive = useObserver(() => adventure.activeUnit === hero);
    const handleClick = useMemo(
        () => (heroIsActive ? unselectAction(adventure) : selectAction(adventure, hero)).run,
        [hero, adventure, heroIsActive]
    );

    const style = heroIsActive ? "is-primary" : "is-info";

    return <HeroDetail onClick={handleClick} hero={hero} style={style}/>
}
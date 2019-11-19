import {AdventureAware} from "../model/Adventure";
import {useObserver} from "mobx-react-lite";
import {AdventureProvider, useAppContext} from "../state";
import {Board} from "./Board";
import React, {useEffect} from "react";
import {HeroAware, HeroDetail} from "./Hero";
import {Observer} from "mobx-react";

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
                    <Observer>{() => (<div className="buttons">
                            {adventure.turnOrder.map(hero => <LocalHeroDetail
                                key={hero.id}
                                adventure={adventure}
                                hero={hero}
                            />)}
                        </div>)}
                    </Observer>
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
    const {
        heroIsActive,
        heroIsUserControlled
    } = useObserver(() => ({
            heroIsActive: adventure.activeUnit === hero,
            heroIsUserControlled: hero.player.isUser,
        })
    );

    const handleClick = undefined;

    const style = heroIsActive ? "is-primary"
        : (heroIsUserControlled ? "is-success" : "is-danger");

    return <HeroDetail onClick={handleClick} hero={hero} style={style}/>
}
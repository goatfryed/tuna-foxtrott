import {AdventureAware} from "../model/Adventure";
import {useObserver} from "mobx-react-lite";
import {AdventureProvider, useAppContext} from "../state";
import {Board} from "./Board";
import React, {useEffect} from "react";
import {HeroAware, HeroDetail} from "./Hero";
import {Observer} from "mobx-react";

type AdventureViewProps = AdventureAware & {
    onSurrender: () => any,
    isIsometric?: boolean,
    onVictory: () => any,
    onDefeat: () => any,
};

export function AdventureView({
    adventure,
    isIsometric,
    onSurrender,
    onVictory,
    onDefeat,
}: AdventureViewProps) {
    useEffect(
        () => {
            adventure.setup();
            return () => adventure.tearDown()
        },
        [adventure]
    );
    const appContext = useAppContext();

    return <AdventureProvider adventure={adventure}>
        <div className="container">
            <Observer>{() => <>
                {adventure.isWonBy(appContext.user) && <VictoryAnnouncment onClose={onVictory}/>}
                {adventure.isLostBy(appContext.user) && <DefeatAnnouncment onClose={onDefeat}/>}
            </>}</Observer>
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

interface AnnouncmentProps {
    onClose: () => void,
}

const VictoryAnnouncment = ({onClose}: AnnouncmentProps) => {
    return <Modal
        announcment="You have won!"
        interaction={<button className="button is-success" onClick={onClose}>VICTORY</button>}
    />
};

const DefeatAnnouncment = ({onClose}: AnnouncmentProps) => {
    return <Modal
        announcment="You have lost :("
        interaction={<button className="button is-danger" onClick={onClose}>DEFEAT</button>}
    />
};

interface ModalProps {
    announcment: React.ReactNode,
    interaction: React.ReactNode,
}

const Modal = ({announcment, interaction}: ModalProps) => {
    return <div className="modal-background" style={{zIndex: 20}}>
        <div className="modal is-active">
            <div>{announcment}</div>
            <div>{interaction}</div>
        </div>
    </div>
};
import {AdventureAware} from "../model/Adventure";
import {useObserver} from "mobx-react-lite";
import {AdventureProvider, useAppContext} from "../state";
import {Board} from "./Board";
import React, {useEffect} from "react";
import {HeroAware, HeroDetail} from "./Hero";
import {Observer} from "mobx-react";
import {Modal} from "./Modal";
import styled from "styled-components";
import {button} from "@storybook/addon-knobs";
import {DomainAction} from "../actions";
import {Runnable} from "../Utility";
import {action} from "mobx";
import {Consumer} from "../helpers";
import {ActionLog} from "./ActionLog";
import {ActionBar, ActionLogSideBar} from "./ActionBar";
import {isUserPlayer} from "../model";

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
        <div className="container"><Observer>{() => <>
                {adventure.isWonBy(appContext.user) && <VictoryAnnouncment onClose={onVictory}/>}
                {adventure.isLostBy(appContext.user) && <DefeatAnnouncment onClose={onDefeat}/>}
            </>}</Observer>
            <ActionCompletion adventure={adventure}/>
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
            <div className="columns">
                <div className="column is-narrow">
                    <ActionLogSideBar>
                        <ActionLog />
                    </ActionLogSideBar>
                </div>
                <div className="column">
                    <Board isIsometric={isIsometric}/>
                </div>
                <div className="column is-narrow">
                    <ActionBar/>
                </div>
            </div>
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
            heroIsUserControlled: isUserPlayer(hero.player),
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
    return <Announcement
        announcment="You have won!"
        interaction={<button className="button is-success" onClick={onClose}>VICTORY</button>}
    />
};

const DefeatAnnouncment = ({onClose}: AnnouncmentProps) => {
    return <Announcement
        announcment="You have lost :("
        interaction={<button className="button is-danger" onClick={onClose}>DEFEAT</button>}
    />
};

interface ModalProps {
    announcment: React.ReactNode,
    interaction: React.ReactNode,
}

const Announcement = ({announcment, interaction}: ModalProps) => {
    return <Modal>
            <div>{announcment}</div>
            <div>{interaction}</div>
    </Modal>
};

function ActionSelection(props: {
    actions: DomainAction[],
    onDismiss: Runnable,
    onSelect: Consumer<DomainAction>
}) {

    return <Modal onBackground={props.onDismiss}>
        <ModalContent>
            <InteractionSelectionContainer>
                {props.actions.map(
                    action => <div key={action.type.name}>
                        <button onClick={() => props.onSelect(action)}
                                className="button"
                        >{action.type.name}</button>
                    </div>
                )}
            </InteractionSelectionContainer>
        </ModalContent>
    </Modal>
}

function ActionCompletion({adventure}: AdventureAware) {
    return useObserver(() => {
        if (!adventure.actionManager.cellIntend) {
            return null;
        }
        const am = adventure.actionManager;
        const cleanupIntend = () => am.cellIntend = null;
        const runAction = action((action: DomainAction) => {
            cleanupIntend();
            adventure.apply(action);
        });

        const suggestedAbilities = adventure.actionManager.suggestedAbilities;

        if (suggestedAbilities.length === 0) {
            return <IntentionCleanup adventure={adventure} message="no action available"/>
        }

        return <ActionSelection
            actions={suggestedAbilities}
            onDismiss={cleanupIntend}
            onSelect={runAction}
        />
    });
}

function IntentionCleanup({message, adventure}: AdventureAware & {message?: string}) {
    useEffect(() => {
        if (message) {
            alert(message);
        }
        adventure.actionManager.cellIntend = null;
    });
    return null;
}

const ModalContent = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    background-color: white;
    width: fit-content;
    min-width: 20vw;
    padding: 1em;
`;

const InteractionSelectionContainer = styled.div`
    width: fit-content;
`;
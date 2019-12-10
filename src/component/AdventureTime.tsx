import {AdventureAware} from "../model/Adventure";
import {useObserver} from "mobx-react-lite";
import {AdventureProvider, useAdventure, useAppContext} from "../state";
import {Board} from "./Board";
import React, {useEffect} from "react";
import {HeroAware, HeroDetail} from "./Hero";
import {Observer} from "mobx-react";
import {Modal} from "./Modal";
import styled from "styled-components";
import {button} from "@storybook/addon-knobs";
import {IngameAbility} from "../actions";
import classNames from "classnames";

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
            <ActionBar />
            <hr/>
            <Board isIsometric={isIsometric}/>
            <hr/>
        </div>
    </AdventureProvider>
}

function ActionBarButton(props: { ability: IngameAbility}) {
    const adventure = useAdventure();
    const {
        isSelected
    } = useObserver(() => ({
        isSelected: adventure.actionManager.abilityIntend === props.ability
    }));
    const onClick = isSelected ?
        () => adventure.actionManager.abilityIntend = null
        : () => adventure.actionManager.abilityIntend = props.ability;


    const className = classNames("button", {"is-primary":isSelected});

    return <button className={className} onClick={onClick}>{props.ability.type.name}</button>;
}

function ActionBar(): React.ReactNodeArray {
    const adventure = useAdventure();
    return useObserver(() => adventure.actionManager
        .abilities
        .filter(ability => !ability.type.isStandard)
        .map(ability => <ActionBarButton key={ability.type.name}
                ability={ability}
            />
        )
    );
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

/**
 * @TODO: this render component has an side effect to reset the interactionRequest if it's not valid
 * @param adventure
 * @constructor
 */
function InteractionSelection({adventure}:AdventureAware) {

    const dismiss = () => adventure.actionManager.interactionRequest = null;

    return useObserver(() => {
        if (adventure.actionManager.interactionRequest === null) {
            return null;
        }
        const intents = adventure.actionManager.expectedAbilityIntends;

        return <Modal onBackground={dismiss}>
            <ModalContent>
                <InteractionSelectionContainer>
                    {intents.map(
                        intent => <div key={intent.type.name}><button onClick={intent.apply} className="button">{intent.type.name}</button></div>
                    )}
                </InteractionSelectionContainer>
            </ModalContent>
        </Modal>
    })
}

function ActionCompletion({adventure}: AdventureAware) {
    return useObserver(() => {
        if (adventure.actionManager.interactionRequest === null) {
            return null;
        }
        const intents = adventure.actionManager.expectedAbilityIntends;

        if (intents.length === 0) {
            return <InteractionCleanup adventure={adventure} />
        }

        return <InteractionSelection adventure={adventure}/>
    });
}

function InteractionCleanup({message, adventure}: AdventureAware & {message?: string}) {
    useEffect(() => {
        if (message) {
            alert(message);
        }
        adventure.actionManager.interactionRequest = null;
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
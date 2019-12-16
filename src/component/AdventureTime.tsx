import {AdventureAware, GameSummary} from "../model/Adventure";
import {useObserver} from "mobx-react-lite";
import {AdventureManagerProvider, AdventureProvider, useActionManager, useAdventure, useAppContext} from "../state";
import {Board} from "./Board";
import React, {useEffect, useState} from "react";
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
import {ActionBar, ActionButton, ActionLogSideBar} from "./ActionBar";
import {isUserPlayer} from "../model";
import {HeroTilePresenter} from "./Roster";
import moment from "moment";
import {AdventureManager} from "../service/adventure/AdventureManager";

type AdventureViewProps = AdventureAware & {
    onSurrender: () => any,
    isIsometric?: boolean,
    onVictory: () => any,
    onDefeat: () => any,
};

const FlexRowCentered = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

export function AdventureView({
    adventure,
    isIsometric,
    onSurrender,
    onVictory,
    onDefeat,
}: AdventureViewProps) {
    const [manager, setManager] = useState<AdventureManager>();
    const context = useAppContext();

    useEffect(
        () => {
            const manager = new AdventureManager(adventure, context.user);
            setManager(manager);
            manager.start();
            return () => manager.tearDown();
        },
        [adventure]
    );

    if (!manager) return <div>Setting up...</div>;

    let summary;
    return <AdventureManagerProvider value={manager}><AdventureProvider adventure={adventure}>
            <div className="container"><Observer>{() => <>
                    {(summary = manager.getSummary()) && (summary.won ?
                        <VictoryAnnouncment summary={summary} onClose={onVictory}/>
                        : <DefeatAnnouncment summary={summary} onClose={onDefeat}/>
                    )}
                </>}</Observer>
                <ActionCompletion />
                <div className="columns">
                    <div className="column">
                        <Observer>{() => (<FlexRowCentered>
                            {adventure.turnOrder.map(hero => <LocalHeroDetail
                                key={hero.id}
                                adventure={adventure}
                                hero={hero}
                            />)}
                        </FlexRowCentered>)}
                        </Observer>
                    </div>
                </div>
                <hr style={{marginTop: 0}}/>
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
                        <div className="buttons" style={{marginBottom: 0}}>
                            <button className="button is-warning" onClick={() => adventure.endTurn()}>End turn</button>
                            <button className="button is-danger" onClick={onSurrender}>Surrender</button>
                        </div>
                        <CellDetailContainer>
                            <CellDetail />
                        </CellDetailContainer>
                        <ActionBar/>
                    </div>
                </div>
                <hr/>
            </div>
        </AdventureProvider>
    </AdventureManagerProvider>
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
    summary: GameSummary,
}

function GameSummaryDisplay(props: {summary: GameSummary}) {
    const duration = moment.duration(
        moment(props.summary.finished).diff(props.summary.started)
    ).humanize();
    return <p>Took you {duration}.<br/>You used {props.summary.turns} turns.</p>
}

const VictoryAnnouncment = ({onClose,summary}: AnnouncmentProps) => {
    return <Modal>
        <div><p className="has-text-success has-text-centered">YOU HAVE WON!</p></div>
        <div><button className="button is-success" onClick={onClose}>VICTORY</button></div>
        <div><GameSummaryDisplay summary={summary} /></div>
    </Modal>
};

const DefeatAnnouncment = ({onClose, summary}: AnnouncmentProps) => {
    return <Modal>
        <div><p className="has-text-danger has-text-centered">YOU HAVE LOST!</p></div>
        <div><button className="button is-danger" onClick={onClose}>DEFEATED</button></div>
        <div><GameSummaryDisplay summary={summary} /></div>
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
                    action => <div key={action.descriptor.name}>
                        <ActionButton action={action.descriptor} onClick={() => props.onSelect(action)} />
                    </div>
                )}
            </InteractionSelectionContainer>
        </ModalContent>
    </Modal>
}

function ActionCompletion() {
    const actionManager = useActionManager();
    const adventure = useAdventure();

    return useObserver(() => {
        if (!actionManager.cellIntend) {
            return null;
        }
        const am = actionManager;
        const cleanupIntend = () => am.cellIntend = null;
        const runAction = action((action: DomainAction) => {
            cleanupIntend();
            adventure.apply(action);
        });

        const suggestedAbilities = actionManager.suggestedAbilities;

        if (suggestedAbilities.length === 0) {
            return <IntentionCleanup message="no action available"/>
        }

        return <ActionSelection
            actions={suggestedAbilities}
            onDismiss={cleanupIntend}
            onSelect={runAction}
        />
    });
}

function IntentionCleanup({message}: {message?: string}) {
    const actionManager = useActionManager();
    useEffect(() => {
        if (message) {
            alert(message);
        }
        actionManager.cellIntend = null;
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

const CellDetailContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12em;
  height: 12ex;
`;

function CellDetail() {
    const adventure = useAdventure();
    const actionManager = useActionManager();
    const displayUnit = useObserver(() => actionManager.hoveredCell?.unit || adventure.activeUnit);

    if (!displayUnit) return null;

    return <HeroTilePresenter
        unit={displayUnit}
        isPrimary={adventure.activeUnit === displayUnit}
    />
}
import {PlayerUnit, UnitDefinition} from "./model";
import {useAppStore} from "./state";
import useForm from "react-hook-form";
import React, {useCallback, useState} from "react";
import {useLocalStore, useObserver} from "mobx-react-lite";
import {Board} from "./component/Board";
import {make} from "./helpers";
import classNames from "classnames";

function UnitEntry({hero, adventure}: {hero: PlayerUnit} & AdventureAware) {

    const included = useObserver(() => adventure.heroes.includes(hero));

    const onClick = useCallback(
        () => {
            if (!included) {
                adventure.heroes.push(hero)
            } else {
                adventure.heroes = adventure.heroes.filter(h => h !== hero);
            }
        },
        [hero, adventure, included]
    );

    const buttonClass = classNames(
        "button is-small",
        adventure.heroes.includes(hero) ? "is-success" : "is-primary"
    );

    return <div className="unit-entry">
        <button className={buttonClass} onClick={onClick}>{hero.name}</button>
    </div>;
}

function HeroList({adventure} : AdventureAware) {

    const appStore = useAppStore();

    return useObserver(() => {
        if (appStore.user.units.length === 0) {
            return <div>Create heroes to get started</div>
        }
        return <div className="unit-list">
            {appStore.user.units.map((hero,key) => <UnitEntry
                key={key} adventure={adventure} hero={hero}
            />)}
        </div>
    });
}

interface AdventureAware {
    adventure: AdventureModel
}

function AddHero(props: {onHeroCreation: (unit: UnitDefinition) => any} & AdventureAware) {
    const form = useForm();
    const onSubmit = useCallback(
        form.handleSubmit(({name}) => {
            props.onHeroCreation({name});
            form.reset();
        }),
        [props.onHeroCreation]
    );

    return <form onSubmit={onSubmit}>
        <input autoComplete="off" name="name" ref={form.register({
            required: 'Required',
            pattern: {
                value: /[A-Z][A-Za-z -_]+/,
                message: "Invalid name",
            }
        })}/>
        {form.errors.name && form.errors.name.message}
    </form>
}

function AdventureSelection(props: { onAdventureSelected: (adventure: AdventureModel) => void }) {

    const adventure = useLocalStore<AdventureModel>(make({
        heroes: [],
    }));

    const appStore = useAppStore();

    const createHero = useCallback(
        (unit: UnitDefinition) => {
            appStore.user.addUnit(unit);
        },
        []
    );

    const startHandler = useCallback(
        () => props.onAdventureSelected(adventure),
        [props.onAdventureSelected, adventure]
    );

    return <>
        <AddHero onHeroCreation={createHero} adventure={adventure}/>
        <div><HeroList adventure={adventure}/></div>
        <div><button onClick={startHandler}>Start adventure</button></div>
    </>;
}

export function App() {
    const appState = useAppStore();

    const [adventure, setAdventure] = useState<AdventureModel|null>(null);

    const selectionLabel = useObserver(
        () => appState.activeUnit !== null ? appState.activeUnit.toString() : "Click on any hero to select him",
    );

    return <section className="section">
        <div className="container">
            <div>🌹</div>
            <div><span>Selection: {selectionLabel}</span></div>
            {adventure === null ?
                <AdventureSelection onAdventureSelected={adventure => setAdventure(adventure)}/>
                : <AdventureView adventure={adventure} />
            }
        </div>
    </section>
}

interface AdventureModel {
    heroes: PlayerUnit[],
}

interface AdventureProps {
    adventure: AdventureModel
}

function AdventureView({}: AdventureProps) {
    return <Board/>
}
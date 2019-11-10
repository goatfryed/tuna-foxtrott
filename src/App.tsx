import {Player, PlayerUnit, UnitDefinition} from "./model";
import {useAppStore} from "./state";
import useForm from "react-hook-form";
import React, {useCallback, useState} from "react";
import {useObserver} from "mobx-react-lite";
import {observer} from "mobx-react";
import {Board} from "./component/Board";

function UnitEntry(props: { onClick: () => PlayerUnit, hero: PlayerUnit }) {
    return <div className="unit-entry">
        <button className="button is-small" onClick={props.onClick}>{props.hero.id}: {props.hero.name}</button>
    </div>;
}

const HeroList: React.FC = observer(() => {
    const appStore = useAppStore();

    if (appStore.user.units.length === 0) {
        return <div>Create heroes to get started</div>
    }

    return <div className="unit-list">
        {appStore.user.units.map(hero => <UnitEntry
            key={hero.id} onClick={() => appStore.activeUnit = hero}
            hero={hero}
        />)}
    </div>
});

function createHero(user: Player, definition: UnitDefinition) {
    const playerUnit = user.addUnit(definition);

    playerUnit.actions.push({
        name: "attack",
        getActionForCell: cell => {
            if (cell.unit === null || cell.unit.player === playerUnit.player) {
                return null;
            }

            return () => alert("bäm");
        }
    });
}

function AddHero() {
    const appStore = useAppStore();
    const form = useForm();
    const onSubmit = useCallback(
        form.handleSubmit(({name}) => {
            createHero(appStore.user, {name});
            form.reset();
        }),
        []
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
                <>
                    <div><AddHero/></div>
                    <div><HeroList/></div>
                    <div><button onClick={() => setAdventure(new AdventureModel())}>Select</button></div>
                </>
                : <AdventureView adventure={adventure} />
            }
        </div>
    </section>
}

class AdventureModel {}

interface AdventureProps {
    adventure: AdventureModel
}

function AdventureView({}: AdventureProps) {
    return <Board/>
}
import {AppStore, Player, UnitDefinition} from "./model";
import {useAppStore} from "./state";
import useForm from "react-hook-form";
import React, {useCallback} from "react";
import {useLocalStore, useObserver} from "mobx-react-lite";
import {ControlledCell} from "./component/Cell";
import {observer} from "mobx-react";
import {useKeyboardListener} from "./component/KeyboardListener";

const HeroList: React.FC = observer(() => {
    const appStore = useAppStore();

    if (appStore.user.units.length === 0) {
        return <div>Create heroes to get started</div>
    }

    return <div>
        <ul>
            {appStore.user.units.map(hero => <li key={hero.id}>
                <button className="button is-small" onClick={() => appStore.activeUnit = hero}>{hero.id}: {hero.name}</button>
            </li>)}
        </ul>
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

const Board = () => {

    const appStore = useAppStore();

    return useObserver(
        () => <div>
            {appStore.board.map((row, y) => <div key={y} className="columns">
                {row.map(cell => <div className="column" key={cell.x}><ControlledCell cell={cell}/></div>)}
            </div>)}
        </div>
    )
};

function useGreetingsKey(appState: AppStore) {
    const computed = useLocalStore(
        () => ({
            get keyboardListener() {
                if (appState.activeUnit === null || appState.activeUnit.player !== appState.currentPlayer) {
                    return null;
                }
                const name = appState.activeUnit.name;

                return (event: KeyboardEvent) => {
                    if (event.key === "s") {
                        alert("Hey, " + name);
                    }
                };
            }
        })
    );
    useKeyboardListener(computed.keyboardListener);
}

function useUnitToggleKeys(appState: AppStore) {
    const switchActiveUnit = useCallback(
        function (direction: number) {
            if (appState.currentPlayer !== null && appState.currentPlayer.units.length > 0) {
                const nextIndex = appState.activeUnit !== null ?
                    //ensure 0 to length -1
                    (appState.currentPlayer.units.indexOf(appState.activeUnit) + appState.currentPlayer.units.length + direction) % appState.currentPlayer.units.length
                    : 0;
                appState.activeUnit = appState.currentPlayer.units[nextIndex];
            }
        },
        [appState]
    );
    useKeyboardListener(
        event => {
            if (event.key === "d") {
                switchActiveUnit(+1);
            }
            if (event.key === "a") {
                switchActiveUnit(-1);
            }
            return;
        },
        [switchActiveUnit]
    );
}

export function App() {
    const appState = useAppStore();

    const selectionLabel = useObserver(
        () => appState.activeUnit !== null ? appState.activeUnit.toString() : "Click on any hero to select him",
    );

    useGreetingsKey(appState);
    useUnitToggleKeys(appState);

    return <section className="section">
        <div className="container">
            <div>🌹</div>
            <div><span>Selection: {selectionLabel}</span></div>
            <div><AddHero/></div>
            <div><HeroList/></div>
            <Board/>
        </div>
    </section>
}
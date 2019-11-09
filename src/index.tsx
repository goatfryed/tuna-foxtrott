import React, {useCallback, useLayoutEffect, useMemo} from "react";
import {render} from "react-dom";
import {observer, useObserver} from "mobx-react";
import useForm from "react-hook-form";

import "./app.scss";
import {StateProvider, useAppStore} from "./state";
import {Cell, Player, UnitDefinition} from "./model";

const HeroList: React.FC = observer(() => {
    const appStore = useAppStore();

    if (appStore.user.units.length === 0) {
        return <div>Create heroes to get started</div>
    }

    return  <div>
        <ul>
            {appStore.user.units.map( hero => <li key={hero.id}><button onClick={() => appStore.activeUnit = hero}>{hero.id}: {hero.name}</button></li>)}
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
        <input name="name" ref={form.register({
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
            {appStore.board.map( (row,y) => <div key={y} className="columns">
                {row.map( cell => <div className="column" key={cell.x}><CellView cell={cell} /></div> )}
            </div>)}
        </div>
    )
};

interface CellProp {
    cell: Cell,
}

function useCellController(cell: Cell) {
    const appStore = useAppStore();

    const interaction = useObserver(
        () => {
            const activeUnit = appStore.activeUnit;
            if (activeUnit === null) {
                if (cell.unit !== null) {
                    return {
                        primary: () => appStore.activeUnit = cell.unit,
                    };
                }
                return;
            }

            if (activeUnit.player !== appStore.currentPlayer) {
                if (cell.unit !== null) {
                    return {
                        primary: () => appStore.activeUnit = cell.unit,
                    };
                }
                return;
            }

            if (cell.unit === null) {
                return {
                    primary: () => activeUnit.cell = cell,
                };
            }

            if (cell.unit.player === appStore.currentPlayer) {
                return {
                    primary: () => appStore.activeUnit = cell.unit,
                };
            }

            // attack?
            return {
                primary: () => window.alert("b#m"),
                secondary: () => appStore.activeUnit = cell.unit,
            };

        }
    );

    const onClick = useMemo(
        () => interaction && ((event: React.MouseEvent) => {
            if (event.button === 2 && interaction.secondary) {
                event.preventDefault();
                interaction.secondary();
            }
            interaction.primary();
        }),
        [interaction]
    );

    return {
        onClick
    }
}

const CellView = ({cell} : CellProp) => {
    const cellLabel = useObserver( () => String(cell) + " " + (cell.unit !== null ? cell.unit.toString() : "empty"));
    // what happens if hook changes?
    const {onClick} = useCellController(cell);

    return useObserver(
        () => <button disabled={onClick === undefined} onClick={onClick}>
            {cellLabel}
        </button>
    );
};

function KeyBoardListener({children}: {children: React.ReactElement}) {

    const state = useAppStore();

    function switchActiveUnit(direction: number) {
        if (state.currentPlayer !== null && state.currentPlayer.units.length > 0) {
            const nextIndex = state.activeUnit !== null ?
                //ensure 0 to length -1
                (state.currentPlayer.units.indexOf(state.activeUnit) + state.currentPlayer.units.length + direction) % state.currentPlayer.units.length
                : 0;
            state.activeUnit = state.currentPlayer.units[nextIndex];
        }
    }

    const keyPressHandler = useCallback(
        event => {
            if (event.key === "d") {
                switchActiveUnit(+1);
            }
            if (event.key === "a") {
                switchActiveUnit(-1);
            }
            return;
        },
        [state]
    );

    useLayoutEffect(
        () => {
            document.addEventListener("keypress", keyPressHandler);
            return () => document.removeEventListener("keypress", keyPressHandler);
        },
        [keyPressHandler]
    )

    return children;
}

function App() {
    const appState = useAppStore();

    const selectionLabel = useObserver(
        () => appState.activeUnit !== null ? appState.activeUnit.toString() : "Click on any hero to select him",
    );

    return <section className="section">
        <div className="container">
            <div>🌹</div>
            <AddHero/>
            <li><span>Selection: {selectionLabel}</span></li>
            <HeroList/>
            <Board/>
        </div>
    </section>;
}

render(
    <StateProvider>
        <KeyBoardListener>
            <App/>
        </KeyBoardListener>
    </StateProvider>,
    document.getElementById("app")
);
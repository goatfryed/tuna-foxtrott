import React, {useCallback, useMemo} from "react";
import {render} from "react-dom";
import {observer} from "mobx-react";
import useForm from "react-hook-form";

import "./app.scss";
import {StateProvider, useAppStore} from "./state";
import {CellModel, Hero} from "./model";
import {useComputed} from "mobx-react-lite";


const HeroList: React.FC = observer(() => {
    const appStore = useAppStore();

    let selectedHero = appStore.selected;

    if (appStore.heroes.length === 0) {
        return <div>Create heroes to get started</div>
    }

    return  <div>
        <ul>
            <li><span>Selection: {selectedHero !== null ? selectedHero.toString() : "Click on any hero to select him"}</span></li>
            {appStore.heroes.map( hero => <li key={hero.id}><button onClick={() => appStore.selected = hero}>{hero.id}: {hero.name}</button></li>)}
        </ul>
    </div>
});

function AddHero() {
    const appStore = useAppStore();
    const form = useForm();
    const onSubmit = useCallback(
        form.handleSubmit(({name}) => {
            appStore.addHero(new Hero(name));
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

const Board = observer(() => {
    const appStore = useAppStore();

    const onClick = useComputed(
        () => {
            let selected = appStore.selected;

            return (cell: CellModel) => {
                if (selected === null && cell.unit === null) return undefined;
                if (cell.unit === null) return () => cell.unit = selected;
                // if (cell.unit !== null)
                return () => appStore.selected = cell.unit;
            }
        },
        []
    );

    return <div>
        {appStore.board.map( (row,y) => <div key={y} className="columns">
            {row.map( cell => <div className="column" key={cell.x}><Cell cell={cell} getInteraction={onClick} /></div> )}
        </div>)}
    </div>
});

interface CellProp {
    cell: CellModel,
    getInteraction: (cell: CellModel) => ((() => any) | undefined),
}

const Cell = observer(({cell, getInteraction} : CellProp) => {
    let unit = cell.unit;
    const onClick = useMemo(() => getInteraction(cell), [getInteraction]);

    return <button disabled={onClick === undefined} onClick={onClick}>{String(cell)}: {unit !== null ? unit.toString() : "empty"}</button>
});

render(
    <StateProvider>
        <section className="section">
            <div className="container">
                <div>🌹</div>
                <AddHero />
                <HeroList />
                <Board />
            </div>
        </section>
    </StateProvider>,
    document.getElementById("app")
);
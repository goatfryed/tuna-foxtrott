import {Adventure, AdventureAware} from "../model/Adventure";
import {useAppStore} from "../state";
import {useObserver} from "mobx-react-lite";
import React, {useCallback, useMemo} from "react";
import {createBoard, Player, PlayerUnit, UnitDefinition} from "../model";
import classNames from "classnames";
import useForm from "react-hook-form";

function HeroDetail({hero, adventure}: { hero: PlayerUnit } & AdventureAware) {

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

function HeroList({adventure}: AdventureAware) {

    const appStore = useAppStore();

    return useObserver(() => {
        if (appStore.user.units.length === 0) {
            return <div>Create heroes to get started</div>
        }
        return <div className="unit-list">
            {appStore.user.units.map((hero, key) => <HeroDetail
                key={key} adventure={adventure} hero={hero}
            />)}
        </div>
    });
}

function AddHero(props: { onHeroCreation: (unit: UnitDefinition) => any } & AdventureAware) {
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

function createAdventure(user: Player) {
    return () => {
        const board = createBoard(5, 5);
        const adventure = new Adventure(board);
        const enemy = new Player( "enemy");

        adventure.players.push(user);
        adventure.players.push(enemy);

        let soldier1 = enemy.addUnit({name:"soldier1"});
        let soldier2 = enemy.addUnit({name:"soldier2"});

        adventure.board[0][3].unit = soldier1;
        adventure.board[1][3].unit = soldier2;

        return adventure;
    }
}

export function AdventureSelection(props: { onAdventureSelected: (adventure: Adventure) => void }) {

    const appStore = useAppStore();
    const adventure = useMemo(createAdventure(appStore.user), []);

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
        <div>
            <button onClick={startHandler}>Start adventure</button>
        </div>
    </>;
}
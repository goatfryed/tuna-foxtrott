import * as React from "react";
import {useLayoutEffect, useRef, useState} from "react";
import {IObservableArray} from "mobx";
import {useObserver} from "mobx-react";
import styled, {css} from "styled-components";
import {Modal} from "../Modal";
import useForm from "react-hook-form";
import {useAppContext} from "../../state";
import {Unit, UnitDefinition, UnitImpl} from "../../model/UnitImpl";
import {Definitions} from "../../config/Heroes";
import {assertNever} from "../../Utility";

type UnitBlueprint = {definition: UnitDefinition}

const heroClasses: [string,UnitBlueprint][] = [
    [ "Axel", {definition: Definitions.AXEL}],
    [ "Bower", {definition: Definitions.BOWER}],
    [ "Macel", {definition: Definitions.MACEL}],
];

function HireHeroCard(props: { onCancel: () => void, onHire: (name: string, u: UnitBlueprint) => void }) {
    const [heroClass, setSelectedClass] = useState(heroClasses[0]);
    const lastHeroClass = useRef(heroClass);
    const {register, errors, handleSubmit} = useForm<{name: string}>();
    const nameRef = useRef<HTMLInputElement|null>();
    const registerNameRef = (instance: HTMLInputElement|null) => register({
        required: 'Required',
        pattern: {
            value: /[A-Z][A-Za-z -_]+/,
            message: "Invalid name",
        }
    })(instance);

    useLayoutEffect(
        () => {
            if (nameRef.current) {
                if (
                    !nameRef.current.value ||
                    lastHeroClass.current[0] === nameRef.current.value
                ) {
                    nameRef.current.value = heroClass[0];
                }
            }
            lastHeroClass.current = heroClass;
        },
        [heroClass]
    );

    const onSubmit = handleSubmit(
        ({name}) => {
            props.onHire(name, heroClass[1]);
        }
    );

    return <div className="modal-card">
        <div className="modal-card-head">Hire Hero</div>
        <div className="modal-card-body">
            <div className="buttons">
                {heroClasses.map(def => <button
                        className={"button" + (def === heroClass ? " is-primary":"")}
                        onClick={() => setSelectedClass(def)}
                    >
                        {def[0]}
                    </button>
                    )
                }
            </div>
            <div>
                <label>
                    Name <input autoComplete="off" name="name"
                        ref={instance => {nameRef.current = instance; registerNameRef(instance);}}
                    />
                </label>
                {errors.name && <span> {errors.name?.message}</span>}
            </div>

        </div>
        <div className="modal-card-foot">
            <button className="button is-success" onClick={onSubmit}>Hire</button>
            <button className="button is-danger" onClick={props.onCancel}>Cancel</button>
        </div>
    </div>;
}

function createFromBlueprint(name: string, blueprint: UnitBlueprint): UnitImpl {
    if ("definition" in blueprint) {
        return  new UnitImpl(name, blueprint.definition);
    }
    assertNever(blueprint, "unexpected blueprint case");
}

export function RosterManager(props: {navigator: (screen: string) => void}) {
    const [showHeroHire, setShowHeroHire] = useState(false);
    const {user} = useAppContext();

    function handleHire(name: string, blueprint: UnitBlueprint) {

        user.addUnit(createFromBlueprint(name, blueprint));
        setShowHeroHire(false);
    }

    return useObserver( () => <div className="container">
        {showHeroHire && <Modal>
            <HireHeroCard
                onCancel={() => setShowHeroHire(false)}
                onHire={handleHire}
            />
        </Modal>
        }
        <div>🐱‍🚀🐱‍👓🐱‍👤</div>
        <hr/>
        <div>
            <RosterBrowser roster={user.units} />
        </div>
        <hr/>
        <button className={"button " + (user.units.length === 0 ? "is-warning" : "is-primary")}
                onClick={() => props.navigator("Adventures")}
                disabled={user.units.length === 0}
        >Adventures</button>
        <button className="button is-success" onClick={() => setShowHeroHire(true)}>Hire hero</button>
    </div>)
}

const Container = styled.div`
    padding: 0.5em;
    display: flex;
    flex-flow: row;
    justify-content: center;
    align-items: center;
`;

export function RosterBrowser(props: { roster: IObservableArray<Unit> }) {
    return useObserver(() => <Container>
        {props.roster.map( u => <HeroEntry hero={u} />)}
    </Container>);
}

const darkHover = css`
    &:hover {
        filter: brightness(1.15);
    }
`;

const HeroTile = styled.div`
    margin: 0.5em;
    padding: 0.5em;
    max-width: 24ex;
    flex-grow: 1;
    background-color: rgb(121,200,126);
    border-color: rgb(117,175,122);
    border-width: 0 3px 3px 0;
    border-style: solid;
    border-radius: 0.3em;
    ${darkHover}
`;

const Line = styled.hr`
    margin: 0 0 0.5em 0;
`;

export function HeroEntry(props: {hero: Omit<Unit,"abilities">}) {
    return <HeroTile>
        {props.hero.name}
        <Line />
        ❤ {props.hero.baseHealth} - 👣 {props.hero.baseSpeed} - 🚄 {props.hero.initiativeDelay}
    </HeroTile>
}


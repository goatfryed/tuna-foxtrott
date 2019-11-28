import * as React from "react";
import {useLayoutEffect, useRef, useState} from "react";
import {IObservableArray} from "mobx";
import {useObserver} from "mobx-react";
import {UnitDefinition} from "../../model";
import styled, {css} from "styled-components";
import {Modal} from "../Modal";
import useForm from "react-hook-form";
import {useAppContext} from "../../state";

const heroClasses: UnitDefinition[] = [
    {
        name: "Axel",
        baseHealth: 6,
        baseSpeed: 3,
        initiativeDelay: 110,
    },
    {
        name: "Bower",
        baseHealth: 4,
        baseSpeed: 2,
        initiativeDelay: 80,
    },
    {
        name: "Macel",
        baseHealth: 5,
        baseSpeed: 4,
        initiativeDelay: 95,
    }
];

function HireHeroCard(props: { onCancel: () => void, onHire: (u: UnitDefinition) => void }) {
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
                    lastHeroClass.current.name === nameRef.current.value
                ) {
                    nameRef.current.value = heroClass.name;
                }
            }
            lastHeroClass.current = heroClass;
        },
        [heroClass]
    );

    const onSubmit = handleSubmit(
        ({name}) => {
            props.onHire({
                ...heroClass,
                name
            });
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
                        {def.name}
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

export function RosterManager(props: {navigator: (screen: string) => void}) {
    const [showHeroHire, setShowHeroHire] = useState(false);
    const {user} = useAppContext();

    function handleHire(unit: UnitDefinition) {
        user.addUnit(unit);
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

export function RosterBrowser(props: { roster: IObservableArray<UnitDefinition> }) {
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

export function HeroEntry(props: {hero: UnitDefinition}) {
    return <HeroTile>
        {props.hero.name}
        <Line />
        ❤ {props.hero.baseHealth} - 👣 {props.hero.baseSpeed} - 🚄 {props.hero.initiativeDelay}
    </HeroTile>
}


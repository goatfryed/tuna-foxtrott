import * as React from "react";
import {useLayoutEffect, useRef, useState} from "react";
import {useObserver} from "mobx-react";
import styled, {css} from "styled-components";
import {Modal} from "../Modal";
import useForm from "react-hook-form";
import {useAppContext} from "../../state";
import {UnitDefinition, UnitImpl} from "../../model/UnitImpl";
import {HeroDefinitions} from "../../config/Heroes";
import {assertNever, Runnable} from "../../Utility";
import {UnitSelectionItem, UnitSelectionModel} from "../AdventureSelection";
import {Consumer} from "../../helpers";

type UnitBlueprint = {definition: UnitDefinition}

const heroClasses: [string,UnitBlueprint][] = [
    [ "Axel", {definition: HeroDefinitions.AXEL}],
    [ "Bower", {definition: HeroDefinitions.BOWER}],
    [ "Macel", {definition: HeroDefinitions.MACEL}],
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

interface UnitSelectionProps {
    onSelectionUpdate: Consumer<UnitSelectionItem>,
    selectionModel: UnitSelectionModel,
}

export function RosterManager(props: UnitSelectionProps) {
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
        <div className="columns">
            <div className="column">🐱‍🚀🐱‍👓🐱‍👤</div>
            <div className="column is-narrow">
                <button className="button is-success"
                        onClick={() => setShowHeroHire(true)}
                >Hire hero</button>
            </div>
        </div>
        <hr/>
        <div>
            <RosterBrowser
                onSelectionUpdate={props.onSelectionUpdate}
                selectionModel={props.selectionModel}
            />
        </div>
    </div>)
}

const Container = styled.div`
    padding: 0.5em;
    display: flex;
    flex-flow: row;
    justify-content: center;
    align-items: center;
`;

export function RosterBrowser(props: UnitSelectionProps) {
    return useObserver(() => <Container>
        {Object.values(props.selectionModel).map( item => <HeroEntry
            item={item}
            onSelection={() => props.onSelectionUpdate(item)}
        />)}
    </Container>);
}

const darkHover = css`
    &:hover {
        filter: brightness(1.15);
    }
`;

const unselected = css`
    background-color: rgb(121,200,126);
    border-color: rgb(117,175,122);
`;
const selected = css`
    background-color: rgb(45, 206, 203);
    border-color: rgb(45,175,172);
`;

const HeroTile = styled.div<{isSelected: boolean}>`
    margin: 0.5em;
    padding: 0.5em;
    max-width: 24ex;
    flex-grow: 1;
    border-width: 0 3px 3px 0;
    border-style: solid;
    border-radius: 0.3em;
    ${props => props.isSelected ? selected : unselected};
    ${darkHover}
`;

const Line = styled.hr`
    margin: 0 0 0.5em 0;
`;

export function HeroEntry(props: {item: UnitSelectionItem, onSelection: Runnable}) {
    return <HeroTile
        onClick={props.onSelection}
        isSelected={props.item.isSelected}
    >
        {props.item.unit.name}
        <Line />
        <StatsContainer>
            <StatDisplay icon="❤"
                         current={props.item.unit.currentHealth}
                         total={props.item.unit.maxHealth}
            />
            <StatDisplay icon="👣" current={props.item.unit.baseSpeed} />
            <StatDisplay icon="🚄" current={props.item.unit.initiativeDelay} />
        </StatsContainer>
    </HeroTile>
}

const StatsContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-items: flex-end;
    align-content: center;
`;

const StatField = styled.div`
    width: fit-content;
    height: fit-content;
    text-align: center;
    flex-grow: 1;
    flex-shrink: 0;
`;

function StatDisplay(props: {icon: string, current: number, total?:number}) {
    return <StatField>{props.icon} {props.current}{props.total && ("/"+props.total)}</StatField>
}


import {Adventure} from "../model/Adventure";
import {useAppContext} from "../state";
import React, {Reducer, useCallback, useEffect, useMemo, useReducer, useState} from "react";
import {PlayerUnit, UnitDefinition} from "../model";
import useForm from "react-hook-form";
import {HeroDetail} from "./Hero";
import {AdventureDescription, adventureDescriptions as defaultAdventures} from "../adventure";
import {reaction} from "mobx";

function LocalHeroDetail(
    {heroItem, onClick}:
    {heroItem: UnitSelectionItem, onClick: (item: UnitSelectionItem) => void}
 ) {
    const style = heroItem.isSelected ? "is-success" : "is-info";

    const handleClick = useCallback(
        () => onClick(heroItem),
        [heroItem]
    );

    return <HeroDetail hero={heroItem.unit} onClick={handleClick} style={style}/>
}

const HeroList = React.memo(
    (props: {onItemClick: (item: UnitSelectionItem) => void, model: UnitSelectionModel}) => {
        const {model} = props;

        const items = useMemo(() => Object.values(model), [model]);

        if (items.length === 0) {
            return <div>Create heroes to get started</div>
        }

        return <div className="unit-list">
            {items.map(item => <LocalHeroDetail
                key={item.unit.id} heroItem={item}
                onClick={props.onItemClick}
            />)}
        </div>
    }
);

function AddHero(props: { onHeroCreation: (unit: UnitDefinition) => any }) {
    const form = useForm();
    const onSubmit = useCallback(
        form.handleSubmit(({name}) => {
            props.onHeroCreation({name, baseHealth: 5});
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

interface AdventureSelectionProps {
    onAdventureSelected: (adventure: Adventure) => void,
    adventureDescriptions?: AdventureDescription[],
}

interface UnitSelectionItem {
    unit: PlayerUnit,
    isSelected: boolean,
}

type UnitSelectionModel = {[key: number]: UnitSelectionItem}

interface RefreshAction {
    type: "REFRESH",
    units: PlayerUnit[]
}
interface ToggleAction {
    type: "TOGGLE",
    item: UnitSelectionItem,
}

function createUnitSelectionItem(unit: PlayerUnit) {
    return {
        unit,
        isSelected: false
    }
}

function useUnitSelectionModel() {
    const appStore = useAppContext();

    const mapUnitsToSelectionModel = (units: PlayerUnit[]) => {
        return units
            .map(createUnitSelectionItem)
            .reduce((map, item) => {
                    map[item.unit.id] = item;
                    return map;
                }, {} as UnitSelectionModel
            );
    };

    const [unitSelectionModel, dispatch] = useReducer<Reducer<UnitSelectionModel, RefreshAction|ToggleAction>, PlayerUnit[]>(
        (model, action) => {
            if (action.type === "TOGGLE") {
                return {...model, [action.item.unit.id]: {...action.item, isSelected: !action.item.isSelected}}
            }
            if (action.type === "REFRESH") {
                const nextModel: UnitSelectionModel = {};
                for (const unit of action.units) {
                    nextModel[unit.id] = unit.id in model ?
                        {...model[unit.id], unit}
                        : createUnitSelectionItem(unit)
                }

                return nextModel;
            }
            return model;
        },
        appStore.user.units,
        mapUnitsToSelectionModel
    );

    const toggleItem = useCallback(
        (item: UnitSelectionItem) => dispatch({type: "TOGGLE", item})
        , []
    );

    useEffect(
        () => reaction(
            () => appStore.user.units.slice(0),
            units => {
                dispatch({type: "REFRESH", units});
            }
        ),
        []
    );

    return {
        unitSelectionModel,
        toggleItem,
    }
}

export function AdventureSelection(
    {
        onAdventureSelected,
        adventureDescriptions = defaultAdventures
    }: AdventureSelectionProps
) {

    const appStore = useAppContext();
    const {
        unitSelectionModel,
        toggleItem
    } = useUnitSelectionModel();
    const [selectedAdventure, selectAdventure] = useState<AdventureDescription>();

    const createHero = useCallback(
        (unit: UnitDefinition) => {
            appStore.user.addUnit(unit);
        },
        []
    );

    const selectedUnits = useMemo(() => Object.values(unitSelectionModel)
        .filter(({isSelected}) => isSelected)
        .map(({unit}) => unit),
    [unitSelectionModel]
    );

    const user = appStore.user;
    const startAdventure = useMemo(
        () => {
            if (!selectedAdventure || selectedUnits.length === 0) {
                return;
            }
            return () => {
                onAdventureSelected(selectedAdventure.factory(user, selectedUnits))
            }
        },
        [selectedUnits, selectedAdventure, user]
    );


    return <>
        <AddHero onHeroCreation={createHero} />
        <div><HeroList model={unitSelectionModel} onItemClick={toggleItem}/></div>
        <hr/>
        <div>
            {adventureDescriptions.map(
                description => <button key={description.id}
                    className={"button" + (selectedAdventure === description ? " is-primary":"")}
                    onClick={() => selectAdventure(curr => curr === description ? undefined : description)}
                >
                    {description.name}
                </button>
            )}
        </div>
        <hr/>
        <div>
            <button className="button" disabled={!startAdventure} onClick={startAdventure}>Start adventure</button>
        </div>
    </>;
}
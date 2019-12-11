import {useAppContext} from "../state";
import React, {Reducer, useCallback, useEffect, useMemo, useReducer} from "react";
import {HeroDetail} from "./Hero";
import {AdventureDescription, adventureDescriptions as defaultAdventures} from "../adventure";
import {reaction} from "mobx";
import {IngameUnit} from "../model/IngameUnit";

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
React.memo(
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

interface AdventureSelectionProps {
    onAdventureSelected: (adventure: AdventureDescription|undefined) => void,
    selectedAdventure?: AdventureDescription,
    adventureDescriptions?: AdventureDescription[],
}

export interface UnitSelectionItem {
    unit: IngameUnit,
    isSelected: boolean,
}

export type UnitSelectionModel = {[key: number]: UnitSelectionItem}

interface RefreshAction {
    type: "REFRESH",
    units: IngameUnit[]
}
interface ToggleAction {
    type: "TOGGLE",
    item: UnitSelectionItem,
}

function createUnitSelectionItem(unit: IngameUnit) {
    return {
        unit,
        isSelected: false
    }
}

export function useUnitSelectionModel() {
    const appStore = useAppContext();

    const mapUnitsToSelectionModel = (units: IngameUnit[]) => {
        return units
            .map(createUnitSelectionItem)
            .reduce((map, item) => {
                    map[item.unit.id] = item;
                    return map;
                }, {} as UnitSelectionModel
            );
    };

    const [unitSelectionModel, dispatch] = useReducer<Reducer<UnitSelectionModel, RefreshAction|ToggleAction>, IngameUnit[]>(
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
        selectedAdventure,
        adventureDescriptions = defaultAdventures
    }: AdventureSelectionProps
) {

    return <>
        <div>
            {adventureDescriptions.map(
                description => <button key={description.id}
                    className={"button" + (selectedAdventure === description ? " is-primary":"")}
                    onClick={() => onAdventureSelected(selectedAdventure === description ? undefined : description)}
                >
                    {description.name}
                </button>
            )}
        </div>
    </>;
}
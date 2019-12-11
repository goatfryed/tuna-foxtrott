import {useAppContext} from "../state";
import React, {Reducer, useCallback, useEffect, useReducer} from "react";
import {AdventureDescription, adventureDescriptions as defaultAdventures} from "../adventure";
import {reaction} from "mobx";
import {UnitImpl} from "../model/UnitImpl";

interface AdventureSelectionProps {
    onAdventureSelected: (adventure: AdventureDescription|undefined) => void,
    selectedAdventure?: AdventureDescription,
    adventureDescriptions?: AdventureDescription[],
}

export interface UnitSelectionItem {
    unit: UnitImpl,
    isSelected: boolean,
}

export type UnitSelectionModel = {[key: number]: UnitSelectionItem}

interface RefreshAction {
    type: "REFRESH",
    units: UnitImpl[]
}
interface ToggleAction {
    type: "TOGGLE",
    item: UnitSelectionItem,
}

function createUnitSelectionItem(unit: UnitImpl) {
    return {
        unit,
        isSelected: false
    }
}

export function useUnitSelectionModel() {
    const appStore = useAppContext();

    const mapUnitsToSelectionModel = (units: UnitImpl[]) => {
        return units
            .map(createUnitSelectionItem)
            .reduce((map, item) => {
                    map[item.unit.id] = item;
                    return map;
                }, {} as UnitSelectionModel
            );
    };

    const [unitSelectionModel, dispatch] = useReducer<Reducer<UnitSelectionModel, RefreshAction|ToggleAction>, UnitImpl[]>(
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
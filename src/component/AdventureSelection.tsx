import {useAppContext} from "../state";
import React, {Reducer, useCallback, useEffect, useReducer} from "react";
import {TrackedAdventure} from "../adventure";
import {reaction} from "mobx";
import {UnitImpl} from "../model/UnitImpl";
import {FlexColumnCentered} from "App/component/Basic/FlexBox";
import {Runnable} from "App/Utility";
import styled from "styled-components";

interface AdventureSelectionProps {
    onAdventureSelected: (adventure: TrackedAdventure|undefined) => void,
    selectedAdventure: TrackedAdventure|undefined,
    adventures: TrackedAdventure[],
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
        adventures,
    }: AdventureSelectionProps
) {

    return <FlexColumnCentered>
        {adventures.map(
            (adventure) => <AdventureOption key={adventure.description.id}
                adventure={adventure}
                className={selectedAdventure === adventure ? " is-primary":undefined}
                onSelect={() => onAdventureSelected(selectedAdventure === adventure ? undefined : adventure)}
            />
        )}
    </FlexColumnCentered>
}

const AdventureOptionContainer = styled(FlexColumnCentered)`
    min-width: 15em;
    height: 10ex;
    &:not(:last-child) {
      margin-bottom: 0.5ex;
    }
`;

function AdventureOption(props: {
    adventure: TrackedAdventure,
    onSelect: Runnable,
    className?: string,
}) {
    const CompletionState = (function(){
        if (!props.adventure.summary) {
            return <p className="has-text-info">INCOMPLETE</p>
        }
        if (props.adventure.summary.won) {
            return <p><span className="has-text-success">WON</span> in {props.adventure.summary.turns}</p>
        }
        return <p><span className="has-text-danger">LOST</span> in {props.adventure.summary.turns}</p>
    })();

    return <AdventureOptionContainer
       className={!!props.className ? "button "+ props.className : "button"}
       onClick={props.onSelect}
    >
        <p>{props.adventure.description.name}</p>
        {CompletionState}
    </AdventureOptionContainer>
}
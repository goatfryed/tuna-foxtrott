import {action, IObservableArray, observable} from "mobx";
import {Adventure} from "./Adventure";
import {UnitImpl, UnitDefinition} from "./UnitImpl";
import {IngameUnit} from "./IngameUnit";

export class Player {

    readonly units: IObservableArray<IngameUnit> = observable([]);

    isUser: boolean = false;

    constructor(public name: string) {}

    @action addUnit(unit: UnitImpl) {
        let playerUnit = new IngameUnit(unit, this);
        this.units.push(playerUnit);
        return playerUnit;
    }
}

export abstract class Bot extends Player {

    protected shutdownHandler: Array<() => void> = [];

    abstract boot(adventure: Adventure): void;

    shutdown() {
        this.shutdownHandler.forEach(handler => handler());
    }
}

export class AppContext {

    readonly roster: IObservableArray<UnitDefinition> = observable([]);

    constructor(readonly user: Player) {
        user.isUser = true;
    }
}


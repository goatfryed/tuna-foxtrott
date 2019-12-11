import {action} from "mobx";
import {Adventure} from "./Adventure";
import {UnitBaseValues, UnitImpl} from "./UnitImpl";
import {IngameUnit} from "./IngameUnit";
import {shallowObservableArray} from "../helpers";

export class UnitOwner<T extends UnitBaseValues> {
    readonly units = shallowObservableArray<T>();

    constructor(public name: string) {
    }
}

export class User extends UnitOwner<UnitImpl> {}

export class IngamePlayer extends UnitOwner<IngameUnit>{
    @action addUnit(unit: UnitImpl) {
        let playerUnit = new IngameUnit(unit, this);
        this.units.push(playerUnit);
        return playerUnit;
    }
}

export class UserPlayer extends IngamePlayer {
    constructor(readonly user: User) {
        super(user.name);
    }
}

export function isUserPlayer(player: IngamePlayer): player is UserPlayer {
    return "user" in player;
}

export abstract class Bot extends IngamePlayer {

    protected shutdownHandler: Array<() => void> = [];

    abstract boot(adventure: Adventure): void;

    shutdown() {
        this.shutdownHandler.forEach(handler => handler());
    }
}

export class AppContext {
    constructor(readonly user: User) {

    }
}


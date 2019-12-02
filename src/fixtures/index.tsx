import {AppContext, Player} from "../model";
import {UnitImpl} from "../model/UnitImpl";
import {Definitions} from "../config";

export const defaultUser = new Player("karli");

export const defaultContext = new AppContext(defaultUser);

export const axelBase = new UnitImpl("axel", Definitions.AXEL);

export const bowerBase = new UnitImpl("bower", Definitions.BOWER);

export const macelBase = new UnitImpl("macel", Definitions.MACEL);

export const clubberBase = new UnitImpl("clubber", Definitions.CLUBBER);
import {AppContext, Player} from "../model";
import {UnitImpl} from "../model/UnitImpl";
import {HeroDefinitions} from "../config/Heroes";

export const defaultUser = new Player("karli");

export const defaultContext = new AppContext(defaultUser);

export const axelBase = new UnitImpl("axel", HeroDefinitions.AXEL);

export const bowerBase = new UnitImpl("bower", HeroDefinitions.BOWER);

export const macelBase = new UnitImpl("macel", HeroDefinitions.MACEL);

export const clubberBase = new UnitImpl("clubber", HeroDefinitions.CLUBBER);
import {AppContext, User, UserPlayer} from "../model";
import {UnitImpl} from "../model/UnitImpl";
import {HeroDefinitions} from "../config/Heroes";

export const exampleUser = new User("karli");
export const exampleUserPlayer = new UserPlayer(exampleUser);

export const exampleContext = new AppContext(exampleUser);

export const axelBase = new UnitImpl("axel", HeroDefinitions.AXEL);

export const bowerBase = new UnitImpl("bower", HeroDefinitions.BOWER);

export const macelBase = new UnitImpl("macel", HeroDefinitions.MACEL);

export const clubberBase = new UnitImpl("clubber", HeroDefinitions.CLUBBER);
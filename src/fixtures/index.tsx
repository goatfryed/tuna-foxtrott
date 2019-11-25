import {AppContext, Player} from "../model";

export const defaultUser = new Player("karli");

export const defaultContext = new AppContext(defaultUser);
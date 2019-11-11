import React, {PropsWithChildren} from "react";
import {AppStore, Player} from "./model";
import {runInAction} from "mobx";
import {Adventure, AdventureAware} from "./model/Adventure";

const storeContext = React.createContext<AppStore | null>(null);

const appStore = runInAction(() => {
    const user = new Player("user");

    return new AppStore(user);
});

export const useAppStore = () => {
    const store = React.useContext(storeContext);
    if (!store) {
        throw new Error('useAppStore must be used within a StoreProvider');
    }
    return store;
};

export const StateProvider: React.FC = ({children}) => {
    return <storeContext.Provider value={appStore}>{children}</storeContext.Provider>
};

export const adventureContext = React.createContext<Adventure|null>(null);
export function AdventureProvider({children, adventure}: PropsWithChildren<AdventureAware>) {
    return <adventureContext.Provider value={adventure}>{children}</adventureContext.Provider>;
}
export function useAdventure() {
    const adventure = React.useContext(adventureContext);
    if (!adventure) {
        throw new Error('useAdventure must be used within an AdventureProvider');
    }
    return adventure;
}
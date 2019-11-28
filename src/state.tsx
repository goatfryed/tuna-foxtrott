import React, {PropsWithChildren} from "react";
import {AppContext, Player} from "./model";
import {runInAction} from "mobx";
import {Adventure, AdventureAware} from "./model/Adventure";

const defaultAppContext = runInAction(() => {
    const user = new Player("user");
    return new AppContext(user);
});

const appContext = React.createContext<AppContext>(defaultAppContext);

export const useAppContext = () => {
    const store = React.useContext(appContext);
    if (!store) {
        throw new Error('useAppStore must be used within a StoreProvider');
    }
    return store;
};

export const AppContextProvider: React.FC<{context?: AppContext}> = ({children, context = defaultAppContext}) => {
    return <appContext.Provider value={context}>{children}</appContext.Provider>
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
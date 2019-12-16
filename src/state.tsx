import React, {PropsWithChildren} from "react";
import {AppContext, User} from "./model";
import {runInAction} from "mobx";
import {Adventure, AdventureAware} from "./model/Adventure";
import {AdventureManager} from "./service/adventure/AdventureManager";

const defaultAppContext = runInAction(() => {
    const user = new User("_anon");
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

const AdventureModel = React.createContext<Adventure|undefined>(undefined);
const AdventureManagerContext = React.createContext<AdventureManager|undefined>(undefined);

export const AdventureManagerProvider = AdventureManagerContext.Provider;
export function AdventureContextProvider(
    {
        manager,
        children,
    }: PropsWithChildren<{ manager: AdventureManager }>) {
    return <AdventureManagerProvider value={manager}>
        <AdventureProvider adventure={manager.adventure}>
            {children}
        </AdventureProvider>
    </AdventureManagerProvider>
}

export function useAdventurManager(): AdventureManager {
    const manager = React.useContext(AdventureManagerContext);
    if (!manager) {
        throw new Error("useAdventureContext must be used within an AdventureManagerProvider");
    }
    return manager;
}
export function useActionManager() {
    return useAdventurManager().actionManager;
}

export function AdventureProvider({children, adventure}: PropsWithChildren<AdventureAware>) {
    return <AdventureModel.Provider value={adventure}>{children}</AdventureModel.Provider>;
}
export function useAdventure() {
    const adventure = React.useContext(AdventureModel);
    if (!adventure) {
        throw new Error('useAdventure must be used within an AdventureProvider');
    }
    return adventure;
}
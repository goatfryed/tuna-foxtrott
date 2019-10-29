import React from "react";
import {AppStore} from "./model";

const storeContext = React.createContext<AppStore | null>(null);

const appStore = new AppStore(4,2);

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
import React from "react";
import {AppStore, Player} from "./model";
import {action} from "mobx";

const storeContext = React.createContext<AppStore | null>(null);

const appStore = action(function(){
    const user = new Player("user");
    const enemy = new Player( "enemy");

    const store = new AppStore(4,2, user);

    store.players.push(user);
    store.players.push(enemy);

    let soldier1 = enemy.addUnit({name:"soldier1"});
    let soldier2 = enemy.addUnit({name:"soldier2"});

    store.board[0][3].unit = soldier1;
    store.board[1][3].unit = soldier2;
    store.currentPlayer = user;

    return store;
})();

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
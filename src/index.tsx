import React, {useCallback} from "react";
import {render} from "react-dom";
import {action, observable} from "mobx";
import {observer} from "mobx-react";
import useForm from "react-hook-form";

class Hero {
    id: number;
    private static counter: number = 0;

    constructor(public name: string) {
        this.id = Hero.counter++;
    }
}

class AppStore {
    @observable heroes: Hero[] = [];
    @observable name: string = "test";

    @action
    addHero(hero: Hero) {
        this.heroes.push(hero);
    }
}

const appStore = new AppStore();

const storeContext = React.createContext<AppStore | null>(null);

const useAppStore = () => {
    const store = React.useContext(storeContext);
    if (!store) {
        throw new Error('useAppStore must be used within a StoreProvider');
    }
    return store;
};

const StateProvider: React.FC = ({children}) => {
    return <storeContext.Provider value={appStore}>{children}</storeContext.Provider>
};


const HeroList: React.FC = observer(() => {
    const appStore = useAppStore();

    return  <div><ul>
        {appStore.heroes.map( hero => <li key={hero.id}><span>{hero.id}: {hero.name}</span></li>)}
    </ul></div>
});

const AddHero: React.FC = () => {
    const appStore = useAppStore();
    const form = useForm();
    console.log(form);
    const onSubmit = useCallback(
        form.handleSubmit(({name}) => {
            appStore.addHero(new Hero(name));
            form.reset();
        }),
        []
    );

    return <form onSubmit={onSubmit}>
        <input name="name" ref={form.register({
            required: 'Required',
            pattern: {
                value: /[A-Z][A-Za-z -_]+/,
                message: "Invalid name",
            }
        })}/>
        {form.errors.name && form.errors.name.message}
    </form>
};

render(
    <StateProvider>
        <div>
            <div>🌹</div>
            <AddHero />
            <HeroList />
        </div>
    </StateProvider>,
    document.getElementById("app")
);
import React, {createContext} from "react";
import { App } from "./App";
import {rootStore, RootStore} from "../../store/RootStore";
import {HashRouter} from "react-router-dom";

export const StoreContext = createContext<RootStore>({} as RootStore);

export const AppContainer = () => {
    return (
        <StoreContext.Provider value={rootStore}>
            <HashRouter>
                <App/>
            </HashRouter>
        </StoreContext.Provider>

    )
}

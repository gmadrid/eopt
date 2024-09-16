'use client';

import React, {createContext} from "react";

type TabbContextType = [string, ((s: string) => void) | undefined];

export let TabbContext = createContext<TabbContextType>(["transactions", undefined]);

export default function TabbContextComponent(props: { children: React.ReactNode; }) {
    let [tab, setTab] = React.useState("transactions");

    return <TabbContext.Provider value={[tab, setTab]}>
        {props.children}
    </TabbContext.Provider>
}

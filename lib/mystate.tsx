'use client';

import {createContext} from "react";

export interface MyStateStruct { name: string; }

export var myState = createContext<MyStateStruct>({name: "GEORGE"} as MyStateStruct);


export function MyStateContext({children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <myState.Provider value={{name: "Steven"}}>
            {children}
        </myState.Provider>
)
}

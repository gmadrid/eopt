'use client';

import {createContext} from "react";

export let LoginContext = createContext(false);

export default function LoggedInContextComponent(props: { loggedIn: boolean; children: React.ReactNode; }) {
    return <LoginContext.Provider value={props.loggedIn}>
        {props.children}
    </LoginContext.Provider>
}

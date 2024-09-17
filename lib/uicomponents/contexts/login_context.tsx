'use client';

import {createContext, ReactNode, useState} from "react";

type LoginContextType = [boolean, (loggedIn: boolean) => void];

export let LoginContext = createContext<LoginContextType>([false, (_b) => {
}]);

export default function LoggedInContextComponent(props: { loggedIn: boolean; children: ReactNode; }) {
    const [loggedIn, setLoggedIn] = useState(props.loggedIn);

    return <LoginContext.Provider value={[loggedIn, setLoggedIn]}>
        {props.children}
    </LoginContext.Provider>
}

'use client';

import {createContext, Dispatch, SetStateAction, useState} from "react";

export const LoginContext = createContext<[boolean, Dispatch<SetStateAction<boolean>>] | undefined>(undefined);

export function LoginContextProvider({children}: { children: any }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <LoginContext.Provider value={[isLoggedIn, setIsLoggedIn]}>
            {children}
        </LoginContext.Provider>
    );
}

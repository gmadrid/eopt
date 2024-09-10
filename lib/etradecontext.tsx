'use client';

import {createContext} from "react";
import {ETradeClient} from "@/lib/etradeclient";

export var eTradeContext = createContext<ETradeClient | undefined>(undefined);

export function ETradeContext({children}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <eTradeContext.Provider value={{isLoggedIn: () => true }}>
            {children}
        </eTradeContext.Provider>
    )
}

'use client';

import React, {createContext} from "react";
import {Account} from "@/lib/etradeclient";

type AccountContextType = [Account | undefined, undefined | ((account: Account) => void)];

export let AccountContext = createContext<AccountContextType>([undefined, undefined]);

export default function AccountContextComponent(props: { children: React.ReactNode; }) {
    let [accountIdKey, setAccountIdKey] = React.useState(undefined as Account | undefined);

    return <AccountContext.Provider value={[accountIdKey, setAccountIdKey]}>
        {props.children}
    </AccountContext.Provider>
}

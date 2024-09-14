'use client';

import React, {createContext} from "react";

type AccountContextType = [string | undefined, undefined | ((accountId: string) => void)];

export let AccountContext = createContext<AccountContextType>([undefined, undefined]);

export default function AccountContextComponent(props: { children: React.ReactNode; }) {
    let [accountIdKey, setAccountIdKey] = React.useState(undefined as string | undefined);

    return <AccountContext.Provider value={[accountIdKey, setAccountIdKey]}>
        {props.children}
    </AccountContext.Provider>
}

'use client';

import React, {useContext, useEffect, useState} from "react";
import {AccountBalances} from "@/lib/etradeclient";
import {AccountContext} from "@/lib/uicomponents/contexts/account_context";
import TransactionList from "@/lib/uicomponents/transaction_list";
import {formatCurrency} from "@/lib/format";

export default function AccountsPage() {
    let [currentAccount] = useContext(AccountContext);

    let [accountBalances, setAccountBalances] = useState<AccountBalances | undefined>(undefined);
    useEffect(() => {
        if (!currentAccount) {
            return;
        }
        fetch(`http://localhost:3333/api/balances/${currentAccount.accountIdKey}`)
            .then(r => r.json())
            .then(j => {
                setAccountBalances(j as AccountBalances);
            });
    }, [currentAccount]);

    if (!currentAccount) {
        return <><h1>No account selected</h1>
            <p>Please select an account from the sidebar</p>
        </>;
    }

    return <>
        <div>
            <h1>Account Details</h1>
            <div><strong>Account Description:</strong> {accountBalances?.accountDescription}</div>
            <div><strong>Account
                Value:</strong> {formatCurrency(accountBalances?.Computed.RealTimeValues?.totalAccountValue)}</div>
        </div>
        <TransactionList></TransactionList>
    </>;
}

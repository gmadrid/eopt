import React, {useContext, useEffect, useState} from "react";
import {AccountContext} from "@/lib/uicomponents/contexts/account_context";
import {AccountBalances, AccountListResponse} from "@/lib/etradeclient";
import {formatCurrency} from "@/lib/format";
import {TabbContext} from "@/lib/uicomponents/contexts/tab_context";

export default function AccountsMenu(props: { loggedIn: boolean; }) {
    let loggedIn = props.loggedIn;

    let [currentAccount, setCurrentAccount] = useContext(AccountContext);
    let [foo, setFoo] = useContext(TabbContext);
    // TODO: make this just be Account[] and not the AccountListResponse.
    let [accounts, setAccounts] = React.useState({} as AccountListResponse);
    let [accountBalances, setAccountBalances] = useState<AccountBalances | undefined>(undefined);

    useEffect(() => {
        if (loggedIn) {
            // TODO: all of these raw `fetch` calls should be replaced some sort of procedural abstraction.
            fetch('http://localhost:3333/api/accounts')
                .then(r => r.json())
                .then(j => {
                    const account_list_response = j.AccountListResponse as AccountListResponse;
                    setAccounts(account_list_response);
                    if (!currentAccount && account_list_response.Accounts.Account.length > 0) {
                        setCurrentAccount!(account_list_response.Accounts.Account[0]);
                    }
                });
        }
    }, [loggedIn, currentAccount, setCurrentAccount]);

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

    if (!loggedIn) {
        return <></>
    }

    return <>
        <label htmlFor="sidebar-account-select" className={"form-label"}><strong>Account</strong></label>
        <select id="sidebar-account-select" className={"form-select"}>
            {/* TODO: onChange. Doesn't matter now, since I only have a single account. :)*/}
            {accounts?.Accounts?.Account.map((account) => {
                const obscured = `-${account.accountId.slice(-4)}`;
                return <option key={account.accountId}>{account.accountDesc} {obscured}</option>;
            })}
        </select>
        <div className="pt-4"><strong>Description</strong></div>
        <div className="pt-1">{accountBalances?.accountDescription}</div>
        <div className="pt-2"><strong>Account
            Value:</strong> {formatCurrency(accountBalances?.Computed.RealTimeValues?.totalAccountValue)}</div>
    </>
}
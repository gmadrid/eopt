import React, {useContext, useEffect, useState} from "react";
import {AccountContext} from "@/lib/uicomponents/contexts/account_context";
import {AccountBalances, AccountListResponse} from "@/lib/etradeclient";
import {formatCurrency} from "@/lib/format";
import {ConfigContext} from "@/lib/uicomponents/contexts/config_context";

export default function AccountsMenu(props: { loggedIn: boolean; }) {
    let loggedIn = props.loggedIn;

    let [currentAccount, setCurrentAccount] = useContext(AccountContext);
    let [accounts, setAccounts] = React.useState({} as AccountListResponse);
    let [accountBalances, setAccountBalances] = useState<AccountBalances | undefined>(undefined);
    let config = useContext(ConfigContext);

    useEffect(() => {
        if (loggedIn) {
            fetch(`${config.server_self_url}api/accounts`)
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
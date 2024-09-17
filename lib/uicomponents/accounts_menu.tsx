import React, {useContext, useEffect, useState} from "react";
import {AccountContext} from "@/lib/uicomponents/contexts/account_context";
import {AccountBalances, AccountListResponse} from "@/lib/etradeclient";
import {ConfigContext} from "@/lib/uicomponents/contexts/config_context";
import {ETradeClientAPI} from "@/app/api/etrade_api";
import {formatCurrency} from "@/lib/format";

export default function AccountsMenu(props: { loggedIn: boolean; }) {
    let loggedIn = props.loggedIn;

    let [currentAccount, setCurrentAccount] = useContext(AccountContext);
    let [accounts, setAccounts] = React.useState({} as AccountListResponse);
    let [accountBalances, setAccountBalances] = useState<AccountBalances | undefined>(undefined);
    let config = useContext(ConfigContext);

    useEffect(() => {
        if (loggedIn) {
            let client = new ETradeClientAPI(config.server_self_url);
            client.getAccounts()
                .then(account_list_response => {
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
        const client = new ETradeClientAPI(config.server_self_url);
        client.getBalances(currentAccount.accountIdKey)
            .then(j => {
                setAccountBalances(j);
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
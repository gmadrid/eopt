import React, {useContext, useEffect, useState} from "react";
import {AccountContext} from "@/lib/uicomponents/contexts/account_context";
import {Account, AccountBalances} from "@/lib/etradeclient";
import {ConfigContext} from "@/lib/uicomponents/contexts/config_context";
import {ETradeClientAPI} from "@/app/api/etrade_api";
import {formatCurrency} from "@/lib/format";

export default function AccountsMenu(props: { loggedIn: boolean; }) {
    let loggedIn = props.loggedIn;

    let [currentAccount, setCurrentAccount] = useContext(AccountContext);
    let [accounts, setAccounts] = React.useState([] as Account[]);
    let [accountBalances, setAccountBalances] = useState<AccountBalances | undefined>(undefined);
    let config = useContext(ConfigContext);

    useEffect(() => {
        if (loggedIn) {
            let client = new ETradeClientAPI(config.server_self_url);
            client.getAccounts()
                .then(accounts => {
                    setAccounts(accounts);
                    if (!currentAccount && accounts.length > 0) {
                        setCurrentAccount!(accounts[0]);
                    }
                });
        }
    }, [loggedIn, currentAccount, setCurrentAccount, config.server_self_url]);

    useEffect(() => {
        if (!currentAccount) {
            return;
        }
        const client = new ETradeClientAPI(config.server_self_url);
        client.getBalances(currentAccount.accountIdKey)
            .then(j => {
                setAccountBalances(j);
            });
    }, [currentAccount, config.server_self_url]);

    if (!loggedIn) {
        return <></>
    }

    return <>
        <label htmlFor="sidebar-account-select" className={"form-label"}><strong>Account</strong></label>
        <select id="sidebar-account-select" className={"form-select"}>
            {accounts.map((account) => {
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
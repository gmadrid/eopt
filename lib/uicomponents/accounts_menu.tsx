import React, {useContext, useEffect} from "react";
import {AccountContext} from "@/lib/uicomponents/contexts/account_context";
import {Account, AccountListResponse} from "@/lib/etradeclient";
import clsx from "clsx";

export default function AccountsMenu(props: { loggedIn: boolean; }) {
    let loggedIn = props.loggedIn;

    let [accounts, setAccounts] = React.useState({} as AccountListResponse);
    let [accountIdKey, setAccountIdKey] = useContext(AccountContext);

    useEffect(() => {
        if (loggedIn) {
            fetch('http://localhost:3333/api/accounts')
                .then(r => r.json())
                .then(j => {
                    const account_list_response = j.AccountListResponse as AccountListResponse;
                    setAccounts(account_list_response);
                    if (!accountIdKey && account_list_response.Accounts.Account.length > 0) {
                        setAccountIdKey!(account_list_response.Accounts.Account[0].accountIdKey);
                    }
                });
        }
    }, [loggedIn]);

    if (!loggedIn) {
        return <></>
    }

    return <div>
        <div><strong>Accounts</strong></div>
        {accounts && accounts.Accounts && accounts.Accounts.Account.map((account: Account) => {
            return <div className={"ps-3"} key={account.accountId}>
                <a className={
                    clsx({
                        "fw-bold": accountIdKey === account.accountIdKey,
                    })
                } href="#"
                   onClick={() => {
                       setAccountIdKey && setAccountIdKey(account.accountIdKey);
                   }}
                >{account.accountDesc}</a>
            </div>;
        })}
    </div>;
}
'use client';

import React, {useEffect} from "react";

interface AccountListResponse {
    Accounts: AccountInner;
}

interface AccountInner {
    Account: Account[];
}

interface Account {
    accountId: string;
    accountDesc: string;
}

export default function AccountsPage() {
    let [accounts, setAccounts] = React.useState({} as AccountListResponse);

    useEffect(() => {
        fetch('http://localhost:3333/api/accounts')
            .then(r => r.json())
            .then(j => {
                setAccounts(j.AccountListResponse as AccountListResponse);
            });
    }, []);

    console.log(`Accounts: ${JSON.stringify(accounts)}`);

    if (accounts && accounts.Accounts) {
        return <div>
            <h1>Accounts</h1>
            <ul>
                {accounts.Accounts.Account.map((account: any) => {
                    return <li key={account.accountId}> {account.accountDesc}</li>;
                })}
            </ul>
        </div>;
    }

    return <h1>No accounts</h1>;

}

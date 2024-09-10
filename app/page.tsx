'use client';

import {redirect} from "next/navigation";
import {useContext} from "react";
import {LoginContext} from "@/lib/uicomponents/contexts/login_context";

export default function Home() {
    let [isLoggedIn, setIsLoggedIn] = useContext(LoginContext)!;

    if (!isLoggedIn) {
        //redirect("/login")
        console.log("WTF!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    } else {
        console.log("REDIRECTING TO ACCOUNTS");
        redirect("/accounts")
    }

    // let [accounts, setAccounts] = React.useState([]);
    //
    // useEffect(() => {
    //     fetch('http://localhost:3333/api/accounts')
    //         .then(r => r.json())
    //         .then(j => {
    //             console.log("THE ACCOUNTS", j);
    //             setAccounts(j);
    //         });
    // }    , []);
    //
    // if (accounts.AccountListResponse && accounts.AccountListResponse.Accounts) {
    //     return <div>
    //         <h1>Accounts</h1>
    //         <ul>
    //             {accounts.AccountListResponse.Accounts.Account.map((account: any) => {
    //                 return <li key={account.accountId}> {account.accountDesc}</li>;
    //             })}
    //         </ul>
    //     </div>;
    // }
    //
    // return <h1>No accounts</h1>;
}

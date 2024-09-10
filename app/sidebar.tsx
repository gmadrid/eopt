'use client';

import AccountsMenu from "@/lib/uicomponents/accounts_menu";
import PortfoliosMenu from "@/lib/uicomponents/portfolios_menu";
import TransactionsMenu from "@/lib/uicomponents/transactions_menu";
import LoginMenu from "@/lib/uicomponents/login_menu";
import {LoginContext} from "@/lib/uicomponents/contexts/login_context";
import {useContext} from "react";

export default function Sidebar() {
    const [isLoggedIn, setIsLoggedIn] = useContext(LoginContext);

    return (
        <div>
            <AccountsMenu loggedIn={isLoggedIn}/>
            <PortfoliosMenu loggedIn={isLoggedIn}/>
            <TransactionsMenu loggedIn={isLoggedIn}/>
            <LoginMenu loggedIn={isLoggedIn}/>
        </div>
    );
}

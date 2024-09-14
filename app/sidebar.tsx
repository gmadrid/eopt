'use client';

import LoginMenu from "@/lib/uicomponents/login_menu";
import {useContext} from "react";
import {LoginContext} from "@/lib/uicomponents/contexts/login_context";
import SidebarMenu from "@/lib/uicomponents/sidebar_menu";
import AccountsMenu from "@/lib/uicomponents/accounts_menu";

export default function Sidebar() {
    let loggedIn = useContext(LoginContext);
    return (
        <div>
            <AccountsMenu loggedIn={loggedIn}/>
            <SidebarMenu name="Portfolio" href="/portfolio" loggedIn={loggedIn}/>
            <SidebarMenu name="Transactions" href="/transactions" loggedIn={loggedIn}/>
            <LoginMenu loggedIn={loggedIn}/>
        </div>
    );
}

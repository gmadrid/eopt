'use client';

import LoginMenu from "@/lib/uicomponents/login_menu";
import {useContext} from "react";
import {LoginContext} from "@/lib/uicomponents/login_context";
import SidebarMenu from "@/lib/uicomponents/sidebar_menu";

export default function Sidebar() {
    let loggedIn = useContext(LoginContext);
    return (
        <div>
            <SidebarMenu name="Accounts" href="/accounts" loggedIn={loggedIn}/>
            <SidebarMenu name="Portfolio" href="/portfolio" loggedIn={loggedIn}/>
            <SidebarMenu name="Transactions" href="/transactions" loggedIn={loggedIn}/>
            <LoginMenu loggedIn={loggedIn}/>
        </div>
    );
}

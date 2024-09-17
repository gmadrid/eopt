'use client';

import {useContext} from "react";
import {LoginContext} from "@/lib/uicomponents/contexts/login_context";
import AccountsMenu from "@/lib/uicomponents/accounts_menu";
import clsx from "clsx";

export default function Sidebar() {
    let [loggedIn] = useContext(LoginContext);
    if (!loggedIn) {
        return <></>;
    }
    
    return (
        <div className={clsx(
            "bg-body-secondary",
            "rounded-2",
            "border",
            "border-1",
            "border-secondary",
            "p-3",
            "m-0"
        )}>
            <AccountsMenu loggedIn={loggedIn}/>
        </div>
    );
}

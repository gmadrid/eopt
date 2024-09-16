'use client';

import {useContext} from "react";
import {TabbContext} from "@/lib/uicomponents/contexts/tab_context";
import clsx from "clsx";

export default function TabSelector() {
    let [tab, setTab] = useContext(TabbContext);

    return <ul className="pb-3 nav nav-underline">
        <li className="nav-item" key="nav-transactions">
            <a className={clsx(
                "nav-link", {
                    active: tab === "transactions"
                }
            )} onClick={() => setTab!("transactions")}>Transactions</a>
        </li>
        <li className="nav-item" key="nav-Options">
            <a className={clsx(
                "nav-link", {
                    active: tab === "options"
                }
            )} onClick={() => setTab!("options")}>Options</a>
        </li>
        <li className="nav-item" key="nav-research">
            <a className={clsx(
                "nav-link", {
                    active: tab === "research"
                }
            )} onClick={() => setTab!("research")}>Research</a>
        </li>
    </ul>


}

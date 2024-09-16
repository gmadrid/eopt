'use client';

import React, {useContext} from "react";
import TransactionList from "@/lib/uicomponents/transaction_list";
import {TabbContext} from "@/lib/uicomponents/contexts/tab_context";
import OptionsTab from "@/lib/uicomponents/options_tab";
import ResearchTab from "@/lib/uicomponents/research_tab";

export default function AccountsPage() {
    const [tab] = useContext(TabbContext);

    // TODO: move this to '/'
    return <>
        {tab === "transactions" && <TransactionList></TransactionList>}
        {tab === "options" && <OptionsTab></OptionsTab>}
        {tab === "research" && <ResearchTab></ResearchTab>}
    </>;
}

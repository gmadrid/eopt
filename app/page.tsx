'use client';

import {useContext} from "react";
import {TabbContext} from "@/lib/uicomponents/contexts/tab_context";
import TransactionList from "@/lib/uicomponents/transaction_list";
import OptionsTab from "@/lib/uicomponents/options_tab";
import ResearchTab from "@/lib/uicomponents/research_tab";

export default function Home() {
    const [tab] = useContext(TabbContext);

    return <>
        {tab === "transactions" && <TransactionList></TransactionList>}
        {tab === "options" && <OptionsTab></OptionsTab>}
        {tab === "research" && <ResearchTab></ResearchTab>}
    </>;
}

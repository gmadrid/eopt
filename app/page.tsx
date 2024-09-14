'use client';

import {redirect} from "next/navigation";

export default function Home() {
    // The base page just goes straight to the accounts page.
    redirect("/accounts")
}

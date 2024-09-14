'use client';

import {redirect} from "next/navigation";
import {useEffect, useState} from "react";

export default function FinishLoginPage(input: any) {
    const verifier = input.searchParams.code;
    if (!verifier) {
        redirect("/login")
    }

    let [authFinished, setAuthFinished] = useState(false);

    // We cannot let this run twice (in Strict Mode) since each Verifier is only good for one use.
    let done_already = false;

    useEffect(() => {
        if (!authFinished && !done_already) {
            // Set this before the fetch to ensure that we don't run this twice.
            done_already = true;
            fetch('http://localhost:3333/api/auth_callback?verifier=' + verifier)
                .then(r => {
                    return r.json();
                })
                .then(async j => {
                    setAuthFinished(true);
                });
        }
    }, []);

    if (authFinished) {
        redirect("http://localhost:3333/");
    }

    return <>
        <h1>Finishing authentication...</h1>
    </>
}

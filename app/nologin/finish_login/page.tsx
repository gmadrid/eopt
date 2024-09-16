'use client';

import {redirect} from "next/navigation";
import {useContext, useEffect, useState} from "react";
import {ConfigContext} from "@/lib/uicomponents/contexts/config_context";

export default function FinishLoginPage(input: any) {
    const config = useContext(ConfigContext);
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
            fetch(`${config.server_self_url}api/auth_callback?verifier=${verifier}`)
                .then(r => {
                    return r.json();
                })
                .then(async j => {
                    setAuthFinished(true);
                });
        }
    }, []);

    if (authFinished) {
        redirect(`${config.server_self_url}`);
    }

    return <>
        <h1>Finishing authentication...</h1>
    </>
}

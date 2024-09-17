'use client';

import {redirect} from "next/navigation";
import {useContext, useEffect, useState} from "react";
import {ConfigContext} from "@/lib/uicomponents/contexts/config_context";
import {LoginContext} from "@/lib/uicomponents/contexts/login_context";
import {ETradeClientAPI} from "@/app/api/etrade_api";

export default function FinishLoginPage(input: any) {
    const [_loggedIn, setLoggedIn] = useContext(LoginContext);
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
            // Set this before the api call to ensure that we don't run this twice.
            done_already = true;
            let client = new ETradeClientAPI(config.server_self_url);
            client.getAccessToken(verifier)
                .then(() => {
                    setAuthFinished(true);
                    setLoggedIn(true);
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

'use client';

import {useContext, useEffect, useState} from "react";
import {redirect} from "next/navigation";
import {ConfigContext} from "@/lib/uicomponents/contexts/config_context";
import {ETradeClientAPI} from "@/app/api/etrade_api";

export default function LoginPage() {
    let [unauth_done, setUnauthDone] = useState(false);
    let config = useContext(ConfigContext);

    useEffect(() => {
        const client = new ETradeClientAPI(config.server_self_url);
        client.logout().then(() => {
            setUnauthDone(true);
        });
    }, [config.server_self_url]);

    if (unauth_done) {
        redirect('/nologin/login');
    }
}
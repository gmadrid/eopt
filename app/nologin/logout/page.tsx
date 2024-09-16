'use client';

import {useContext, useEffect, useState} from "react";
import {redirect} from "next/navigation";
import {ConfigContext} from "@/lib/uicomponents/contexts/config_context";

export default function LoginPage() {
    let [unauth_done, setUnauthDone] = useState(false);
    let config = useContext(ConfigContext);

    useEffect(() => {
        fetch(`${config.server_self_url}api/unauth`).then(r => {
            setUnauthDone(true);
            return r.json();
        });
    }, []);

    if (unauth_done) {
        redirect('/nologin/login');
    }
}
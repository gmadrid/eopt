'use client';

import React, {useContext, useEffect} from "react";
import {redirect} from "next/navigation";
import ping from "@/lib/ping";
import {LoginContext} from "@/lib/uicomponents/contexts/login_context";

export default function FinishLoginPage(input: any) {
    const verifier = input.searchParams.code;
    if (!verifier) {
        redirect("/login")
    }

    let [isLoggedIn, setIsLoggedIn] = useContext(LoginContext)!;
    if (isLoggedIn) {
        redirect("/");
        return;
    }

    var fooz = false;

    useEffect(() => {
        if (!fooz) {
            fetch('http://localhost:3333/api/auth_callback?verifier=' + verifier)
                .then(r => {
                    return r.json();
                })
                .then(async j => {
                    await ping("FinishLoginPage: " + "auth response: " + JSON.stringify(j));
                    setIsLoggedIn(a => true)
                    //redirect("/")
                });
            return () => {  setIsLoggedIn(a => true); fooz = true; }
        }
    }, []);

    return <>
        <h1>WE ARE HERE</h1>
    </>
}

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
        redirect("/")
    }

    var fooz = false;

    useEffect(() => {
        console.log("RUNNING USE EFFECT", isLoggedIn);
        if (!fooz) {
            console.log("FETCHING");
            fetch('http://localhost:3333/api/auth_callback?verifier=' + verifier)
                .then(r => {
                    console.log("HEADERS:", r.headers);
                    return r.json();
                })
                .then(async j => {
                    console.log("THE J", j);
                    await ping("FinishLoginPage: " + "auth response: " + JSON.stringify(j));
                    setIsLoggedIn(a => true)
                    //redirect("/")
                });
            return () => { console.log("CLEANUP"); setIsLoggedIn(a => true); fooz = true; }
        }
    }, []);

    return <>
        <h1>WE ARE HERE</h1>
    </>
}

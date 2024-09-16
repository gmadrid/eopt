'use client';

import {useEffect, useState} from "react";
import {redirect} from "next/navigation";

export default function LoginPage() {
    let [unauth_done, setUnauthDone] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3333/api/unauth').then(r => {
            setUnauthDone(true);
            return r.json();
        });
    }, []);

    if (unauth_done) {
        redirect('/nologin/login');
    }
}
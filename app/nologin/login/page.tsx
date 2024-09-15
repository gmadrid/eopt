'use client';

import {Button, Col, Form, Row} from "react-bootstrap";
import React, {useEffect} from "react";

export default function LoginPage() {
    const [disabled, setDisabled] = React.useState(true);
    const [authUrl, setAuthUrl] = React.useState("");

    useEffect(() => {
        // TODO: this should be part of the API object.
        fetch('http://localhost:3333/api/auth').then(r => {
            return r.json();
        }).then(async j => {
            setAuthUrl(j.auth_url);
            setDisabled(false);
        });
    }, []);

    return <>
        <h1>eTrade login</h1>
        <p>Before we can look at your accounts, you must authenticate with eTrade and give it permission so share
            your account info.</p>
        <p>At no point, does eOpt have access to your eTrade password, and you can revoke permission at any time.</p>
        <p>When you click on the &ldquo;Login to eTrade&rdquo; button below, you will be redirected to eTrade to login
            and give
            eTrade permission
            to share your account data with us. After you give permission, you will land on a page
            titled &ldquo;Complete
            Authorization.&rdquo; Please enter the Verification Code into the box at the very bottom, and
            hit &ldquo;Submit code&rdquo; to
            complete the login.</p>
        <div>
            <Button href={authUrl} id="auth_button" variant="secondary" target="_blank"
                    disabled={disabled}>Login to eTrade</Button>
        </div>
        <hr/>
        <Row>
            <Col xs={2}></Col>
            <Col xs={8}>
                <Form action="/nologin/finish_login" method="GET">
                    <Form.Group>
                        <Form.Label><strong>Verification Code</strong></Form.Label>
                        <Form.Control name="code" type="text" placeholder="Enter the verification code from eTrade"/>
                    </Form.Group>

                    <Button variant="primary" type="submit" className="mt-2">
                        Submit code
                    </Button>
                </Form>
            </Col>
        </Row>
    </>
}

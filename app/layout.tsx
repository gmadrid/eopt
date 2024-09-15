import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {Col, Container, Navbar, NavbarBrand, Row} from "react-bootstrap";
import clsx from 'clsx';
import Sidebar from "@/app/sidebar";
import {headers} from "next/headers";
import LoggedInContextComponent from "@/lib/uicomponents/contexts/login_context";
import AccountContextComponent from "@/lib/uicomponents/contexts/account_context";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "eTrade Options Tool",
    description: "Most advanced options trading tool on this site",
};

const EoptNavbar = () => {
    return (
        <Navbar expand="lg" className="bg-body-secondary">
            <Container fluid={true}>
                <NavbarBrand>eOpt</NavbarBrand>
            </Container>
        </Navbar>

    );
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    // This gets set in the middleware if there is an auth cookie.
    const logged_in = headers().get("X-LoggedIn") === "true";

    return (
        <html lang="en">
        <head>
        </head>
        <body className={clsx(inter.className)}>
        <LoggedInContextComponent loggedIn={logged_in}>
            <AccountContextComponent>
                <EoptNavbar/>
                <Container>
                    <Row>
                        <Col xs={3} className="pt-3">
                            <Sidebar/>
                        </Col>
                        <Col xs={9} className="pt-3">
                            {children}
                        </Col>
                    </Row>
                </Container>
            </AccountContextComponent>
        </LoggedInContextComponent>
        </body>
        </html>
    );
}

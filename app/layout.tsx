import {Inter} from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {Col, Container, Row} from "react-bootstrap";
import clsx from 'clsx';
import Sidebar from "@/app/sidebar";
import {headers} from "next/headers";
import LoggedInContextComponent from "@/lib/uicomponents/contexts/login_context";
import AccountContextComponent from "@/lib/uicomponents/contexts/account_context";
import OptionAlerts from "@/lib/uicomponents/option_alerts";
import TabbContextComponent from "@/lib/uicomponents/contexts/tab_context";
import TabSelector from "@/lib/uicomponents/tab_selector";
import ConfigContextComponent from "@/lib/uicomponents/contexts/config_context";
import EoptConfig from "@/lib/eopt_config";
import {EoptNavbar} from "@/lib/uicomponents/eoptNavbar";

const inter = Inter({subsets: ["latin"]});

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
        <ConfigContextComponent config={EoptConfig}>
            <LoggedInContextComponent loggedIn={logged_in}>
                <AccountContextComponent>
                    <TabbContextComponent>
                        <EoptNavbar/>
                        <Container>
                            <Row>
                                <Col xs={3} className="pt-3">
                                    <Sidebar/>
                                </Col>
                                <Col xs={9} className="pt-3">
                                    <OptionAlerts/>
                                    <TabSelector/>
                                    {children}
                                </Col>
                            </Row>
                        </Container>
                    </TabbContextComponent>
                </AccountContextComponent>
            </LoggedInContextComponent>
        </ConfigContextComponent>
        </body>
        </html>
    );
}

import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {Col, Container, Row} from "react-bootstrap";
import clsx from 'clsx';
import Sidebar from "@/app/sidebar";
import {LoginContextProvider} from "@/lib/uicomponents/contexts/login_context";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "eTrade Options Tool",
    description: "Most advanced options trading tool on this site",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    var loggedIn = false;


    return (
        <html lang="en">
        <body className={clsx(inter.className)}>
        <Container>
            <LoginContextProvider>
                <Row>
                    <Col xs={2} className="pt-3 border-2 border-end border-black">
                        <h1>eOpt</h1>
                        <Sidebar/>
                    </Col>
                    <Col xs={10} className="pt-3">
                        {children}
                    </Col>
                </Row>
            </LoginContextProvider>
        </Container>
        </body>
        </html>
    );
}

'use client';

import {useContext, useEffect, useState} from "react";
import {ConfigContext} from "@/lib/uicomponents/contexts/config_context";
import {AccountContext} from "@/lib/uicomponents/contexts/account_context";
import {ETradeClientAPI} from "@/app/api/etrade_api";
import {Col, Container, Navbar, NavbarBrand, Row} from "react-bootstrap";
import {PortfolioResponse} from "@/lib/etradeclient";
import {formatCurrency, formatPercent} from "@/lib/format";

export const EoptNavbar = () => {
    let [portfolioResponse, setPortfolioResponse] = useState<PortfolioResponse | undefined>(undefined);
    const context = useContext(ConfigContext);
    const [currentAccount] = useContext(AccountContext);

    useEffect(() => {
        if (!currentAccount) {
            return;
        }
        const client = new ETradeClientAPI(context.server_self_url);
        client.getPortfolio(currentAccount.accountIdKey)
            .then((portfolioResponse) => {
                setPortfolioResponse(portfolioResponse);
            });
    }, [currentAccount]);

    return (
        <Navbar expand="lg" className="bg-body-secondary">
            <Container fluid={true}>
                <NavbarBrand>eOpt</NavbarBrand>
                <Row className="bg-white rounded rounded-2 mx-auto border border-1 border-black">
                    {portfolioResponse &&
                        <>
                            <Col sm="auto">
                                <div>
                                    <small>Today's gain:&nbsp;
                                        {formatCurrency(portfolioResponse.Totals.todaysGainLoss)}&nbsp;
                                        ({formatPercent(portfolioResponse.Totals.todaysGainLossPct)})
                                    </small>
                                </div>
                                <div>
                                    <small>Total gain:&nbsp;
                                        {formatCurrency(portfolioResponse.Totals.totalGainLoss)}&nbsp;
                                        ({formatPercent(portfolioResponse.Totals.totalGainLossPct)})
                                    </small>
                                </div>
                            </Col>
                            <Col sm="auto">
                                <div>
                                    <small>Total market value:&nbsp;
                                        {formatCurrency(portfolioResponse.Totals.totalMarketValue)}
                                    </small>
                                </div>
                                <div>
                                    <small>Cash:&nbsp;
                                        {formatCurrency(portfolioResponse.Totals.cashBalance)}
                                    </small>
                                </div>
                            </Col>
                        </>
                    }
                </Row>
            </Container>
        </Navbar>

    );
}

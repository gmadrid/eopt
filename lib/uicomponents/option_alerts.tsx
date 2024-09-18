'use client';

import {useContext, useEffect, useState} from "react";
import {AccountContext} from "@/lib/uicomponents/contexts/account_context";
import {expirationDate, Portfolio, Position} from "@/lib/etradeclient";
import {formatCurrency, formatProduct} from "@/lib/format";
import clsx from "clsx";
import {ConfigContext} from "@/lib/uicomponents/contexts/config_context";
import {ETradeClientAPI} from "@/app/api/etrade_api";

const getNextFriday = (): Date => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)

    // Calculate days until next Friday
    const daysUntilFriday = (5 - currentDay + 7) % 7;

    // Create a new Date object for the next Friday
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);

    return nextFriday;
};

const inTheMoney = (position: Position): boolean => {
    // Do we have the data?
    if (!position.Complete) {
        return false;
    }
    // Only options can be in the money.
    if (position.Product.securityType !== "OPTN") {
        return false;
    }

    const pieces = position.Complete.baseSymbolAndPrice.trim().split('/');
    const stock_price = parseFloat(pieces[1]);
    const strike_price = position.Product.strikePrice;

    if (position.Product.callPut === 'CALL') {
        return stock_price > strike_price;
    } else {
        return stock_price < strike_price;
    }
}

const closeToMoney = (position: Position): boolean => {
    // Do we have the data?
    if (!position.Complete) {
        return false;
    }
    // Only options can be in the money.
    if (position.Product.securityType !== "OPTN") {
        return false;
    }

    const pieces = position.Complete.baseSymbolAndPrice.trim().split('/');
    const stock_price = parseFloat(pieces[1]);
    const strike_price = position.Product.strikePrice;

    return Math.abs(strike_price - stock_price) < 1;
}

const OptionAlerts = () => {
    let [portfolio, setPortfolio] = useState({} as Portfolio);
    let [currentAccount] = useContext(AccountContext);
    let config = useContext(ConfigContext);

    useEffect(() => {
        if (!currentAccount) {
            return;
        }
        let client = new ETradeClientAPI(config.server_self_url);
        client.getPortfolio(currentAccount.accountIdKey).then((p) => {
            setPortfolio(p);
        });
    }, [currentAccount]);

    const alertableOptions = (portfolio: Portfolio): Position[] => {
        if (!portfolio.positions) {
            return [];
        }
        const next_friday = getNextFriday();

        return portfolio.positions
            .filter(p => p.Product.securityType === "OPTN")
            //.filter(p => inTheMoney(p) || closeToMoney(p))
            .filter(p => {
                return expirationDate(p.Product) <= next_friday;
            }).sort((a, b) => {
                return a.Product.symbol.localeCompare(b.Product.symbol);
            });
    }

    const alert_list = alertableOptions(portfolio);
    if (alert_list.length === 0) {
        return <></>;
    }

    return (
        <div className="alert alert-danger">
            <div className="pb-2"><strong className="fs-4">Alerts</strong></div>
            <table className="table w-auto table-danger table-hover table-sm">
                <thead>
                <th className="fw-bold fs-6"></th>
                <th className="fw-bold fs-6">Option</th>
                <th className="fw-bold fs-6">Stock price</th>
                </thead>
                <tbody>
                {alert_list.map(p => {
                    const pieces = p.Complete?.baseSymbolAndPrice.trim().split('/');
                    const price = formatCurrency(parseFloat(pieces[1]));
                    const in_the_money = inTheMoney(p);
                    const close_to_money = closeToMoney(p);

                    let alert = in_the_money;
                    let warning = close_to_money && !in_the_money;
                    let info = !close_to_money && !in_the_money;
                    let prefix = in_the_money ?
                        <span className="badge text-bg-danger">&nbsp;Alert&nbsp;</span> :
                        close_to_money ?
                            <span className="badge text-bg-warning">Warning</span> :
                            <></>;


                    let classes = clsx("fs-6", "py-0", "border-0", {
                        'text-danger': alert,
                        'text-secondary': info,
                        'text-black': warning,
                        'fw-bold': alert || warning,
                    })
                    return <tr>
                        <td className={classes}>{prefix}</td>
                        <td className={classes}>{formatProduct(p.Product)}</td>
                        <td className={classes}>{price}</td>
                    </tr>
                })}
                </tbody>
            </table>
        </div>
    );
}

export default OptionAlerts;

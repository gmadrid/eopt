'use client';

import {useContext, useEffect, useState} from "react";
import {AccountContext} from "@/lib/uicomponents/contexts/account_context";
import {Portfolio, Position} from "@/lib/etradeclient";
import {formatCurrency, formatProduct} from "@/lib/format";
import clsx from "clsx";

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

    useEffect(() => {
        if (!currentAccount) {
            return;
        }
        fetch(`http://localhost:3333/api/portfolio/${currentAccount.accountIdKey}`)
            .then(r => r.json())
            .then(j => {
                setPortfolio(j as Portfolio);
            });
    }, [currentAccount]);

    const alertableOptions = (portfolio: Portfolio): Position[] => {
        if (!portfolio.positions) {
            return [];
        }
        const next_friday = getNextFriday();

        return portfolio.positions
            .filter(p => p.Product.securityType === "OPTN")
            .filter(p => inTheMoney(p) || closeToMoney(p))
            .filter(p => {
                // TODO: move this logic somewhere to be reused.
                const expiry = new Date(p.Product.expiryYear, p.Product.expiryMonth - 1, p.Product.expiryDay);
                return expiry <= next_friday;
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
            <div className="pb-2"><strong className="fs-4">Options to watch</strong></div>
            {alert_list.map(p => {
                const pieces = p.Complete?.baseSymbolAndPrice.trim().split('/');
                const price = formatCurrency(parseFloat(pieces[1]));
                const in_the_money = inTheMoney(p);
                const close_to_money = closeToMoney(p);

                return <div className={clsx("fw-bold", "fs-5", {
                    'text-danger': in_the_money,
                    'text-success': !in_the_money,
                    'text-warning': close_to_money && !in_the_money,
                })}>{formatProduct(p.Product)} - {price}</div>
            })}
        </div>
    );
}

export default OptionAlerts;

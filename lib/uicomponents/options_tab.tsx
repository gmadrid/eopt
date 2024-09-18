'use client';

import {ReactNode, useContext, useEffect, useState} from "react";
import {ConfigContext} from "@/lib/uicomponents/contexts/config_context";
import {ETradeClientAPI} from "@/app/api/etrade_api";
import {Portfolio, Position} from "@/lib/etradeclient";
import {AccountContext} from "@/lib/uicomponents/contexts/account_context";
import {formatCurrency, formatProduct} from "@/lib/format";
import {compareProducts} from "@/lib/combine";
import findStrategies, {POSITION_TYPE_STOCK} from "@/lib/options/strategies";
import {closeToMoney, inTheMoney} from "@/lib/uicomponents/option_alerts";

export default function OptionsTab() {
    let config = useContext(ConfigContext);
    let [currentAccount] = useContext(AccountContext);

    let [portfolio, setPortfolio] = useState<Portfolio | undefined>(undefined);
    useEffect(() => {
        if (!currentAccount) {
            return;
        }

        const client = new ETradeClientAPI(config.server_self_url);
        client.getPortfolio(currentAccount?.accountIdKey).then(portfolio => {
            setPortfolio(portfolio);
        });

    }, []);

    if (!portfolio) {
        return <div>Loading...</div>;
    }

    const ordered = portfolio.positions.toSorted((a, b) => compareProducts(a.Product, b.Product));
    const optionSymbols = new Set(ordered.filter(position => position.Product.securityType === "OPTN").map(position => position.Product.symbol));
    const optionsAndRelated = ordered.filter(position => optionSymbols.has(position.Product.symbol));

    const groups = groupBy(optionsAndRelated, position => position.Product.symbol);

    Object.keys(groups).forEach(symbol => {
        const group = groups[symbol];
        findStrategies(group);
    });

    return <div className="pb-5">
        {Object.keys(groups).map(symbol => <OptionGroup key={symbol} optionsAndRelated={groups[symbol]}/>)}
    </div>;
}

// Find a stock price in a list.
// NOTE: this is special purpose, and it currently assumes that all prices are for the same stock.
// If there is an equity in the list, get the price from that; otherwise, grab it from an options.
const findStockPrice = (positions: Position[]): number => {
    console.log("list: ", JSON.stringify(positions));
    const equity = positions.find(position => position.Product.securityType === POSITION_TYPE_STOCK);
    console.log("EQUITY: ", JSON.stringify(equity));
    if (equity) {
        return equity.Complete.price;
    }

    console.log("FISRT: ", JSON.stringify(positions[0]));
    return parseFloat(positions[0].Complete.baseSymbolAndPrice.trim().split('/')[1]);
}

// There should always be at least one position in the array.
const OptionGroup = ({optionsAndRelated}: { optionsAndRelated: Position[] }) => {
    const [remaining, strategies] = findStrategies(optionsAndRelated);
    const symbol = optionsAndRelated[0].Product.symbol;

    return <div className="pb-3">
        <h4>{symbol} &mdash; {formatCurrency(findStockPrice(optionsAndRelated))}</h4>
        {remaining.map(position =>
            <div key={position.positionId}>{position.quantity} {formatProduct(position.Product)}</div>
        )}
        {strategies.map(strategy =>
            <div key={strategy.position1.positionId} className="ms-4 mb-3 border-1 border-start border-primary ps-2">
                <strong>{strategy.strategyType}</strong>
                <div><OptionBadge
                    position={strategy.position1}/> {strategy.position1.quantity} {formatProduct(strategy.position1.Product)}
                </div>
                {strategy.position2 &&
                    <div><OptionBadge
                        position={strategy.position2}/> {strategy.position2.quantity} {formatProduct(strategy.position2.Product)}
                    </div>}
            </div>
        )}
    </div>;
}

const OptionBadge = ({position}: { position: Position }): ReactNode => {
    if (inTheMoney(position)) {
        return <span className="badge bg-danger">In the money</span>;
    } else if (closeToMoney(position)) {
        return <span className="badge bg-warning">Close to money</span>;
    } else {
        return <></>
    }
}

function groupBy<T, K extends string>(array: T[], callback: (item: T) => K): Record<K, T[]> {
    const result: Record<K, T[]> = {} as Record<K, T[]>;

    for (const item of array) {
        const key = callback(item);

        if (!result[key]) {
            result[key] = [];
        }

        result[key].push(item);
    }

    return result;
}
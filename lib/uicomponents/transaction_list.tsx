import {ChangeEvent, ReactNode, useContext, useEffect, useState} from "react";
import {AccountContext} from "@/lib/uicomponents/contexts/account_context";
import {Transaction, TransactionListResponse} from "@/lib/etradeclient";
import {formatCurrency, formatDate, formatDate8601, formatDateEtrade, formatProduct, from8601} from "@/lib/format";
import {Col, Row} from "react-bootstrap";
import clsx from "clsx";
import {ConfigContext} from "@/lib/uicomponents/contexts/config_context";

const LabelledCheck = (props: {
    label: string, checkboxId: string, checked: boolean, disabled?: boolean
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
}) => {
    return <div className="form-check">
        <input type="checkbox" className="form-check-input" id={props.checkboxId} checked={props.checked}
               disabled={props.disabled}
               onChange={props.onChange}/>
        <label className="form-check-label" htmlFor={props.checkboxId}>{props.label}</label>
    </div>
}

interface FilterDescription {
    showDividends: boolean;
    showAdjustments: boolean;
    showInterest: boolean;
    showOptionsOnly: boolean;
    filterSymbol: string;
}

const TransactionFilterPicker = (props: {
    filterDescription: FilterDescription,
    setFilterDescription: (filterDescription: FilterDescription) => void
}) => {
    const {filterDescription, setFilterDescription} = props;

    return <Row className="my-3">
        <Col xs="auto">
            <LabelledCheck label="Show Dividends" checkboxId="filter-dividends"
                           checked={filterDescription.showDividends || filterDescription.showOptionsOnly}
                           disabled={filterDescription.showOptionsOnly}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => {
                               setFilterDescription({...filterDescription, showDividends: e.target.checked});
                           }}
            />
        </Col>
        <Col xs="auto">
            <LabelledCheck label="Show Adjustments" checkboxId="filter-adj"
                           checked={filterDescription.showAdjustments && !filterDescription.showOptionsOnly}
                           disabled={filterDescription.showOptionsOnly}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => {
                               setFilterDescription({...filterDescription, showAdjustments: e.target.checked});
                           }}
            />
        </Col>
        <Col xs="auto">
            <LabelledCheck label="Show Interest" checkboxId="filter-int"
                           checked={filterDescription.showInterest && !filterDescription.showOptionsOnly}
                           disabled={filterDescription.showOptionsOnly}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => {
                               setFilterDescription({...filterDescription, showInterest: e.target.checked});
                           }}
            />
        </Col>
        <Col xs="auto">
            <LabelledCheck label="Only Options-related" checkboxId="filter-optonly"
                           checked={filterDescription.showOptionsOnly}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => {
                               setFilterDescription({...filterDescription, showOptionsOnly: e.target.checked});
                           }}
            />
        </Col>
    </Row>
}

const TransactionTable = (props: {
    transactionList: Transaction[] | undefined,
    filterFunc: (t: Transaction) => boolean
}): ReactNode => {
    let {transactionList, filterFunc} = props;

    if (!transactionList) {
        return <div></div>;
    }

    return <table className="ms-1">
        <thead>
        <tr>
            <th className="ps-2">Txn. Date</th>
            <th className="ps-2">Quantity</th>
            <th></th>
            <th className="ps-2">Description</th>
            <th className="ps-2">Type</th>
            <th className="ps-2">Amount</th>
        </tr>
        </thead>
        <tbody>
        {transactionList.filter(filterFunc).map((transaction, index) => {
            // Some transactions don't have a product, show the description instead.
            // This is a total hack. Fix it by adding an actual field somehow.
            const isCombined = transaction.description.startsWith("Combined ");
            let description = formatProduct(transaction.brokerage.product);
            if (!description || description === "") {
                description = transaction.description;
            }

            return <tr key={transaction.transactionId}
                       className={clsx({
                           "bg-body-secondary": index % 2 === 0,
                       })}>
                <td className="ps-2 py-1">{formatDate(transaction.transactionDate)}</td>
                <td className="ps-2 py-1 text-end">{transaction.brokerage.quantity == 0 ? "" : transaction.brokerage.quantity}</td>
                <td className="ps-2 py-1">{isCombined ? "\u29C9" : ""}</td>
                <td className="ps-2 py-1">{description}</td>
                <td className="ps-2 py-1">{transaction.transactionType}</td>
                <td className="px-2 py-1 text-end">{formatCurrency(transaction.amount)}</td>
            </tr>;
        })}
        </tbody>
    </table>
}

const TransactionDatePicker = (props: {
    startDate: Date, endDate: Date,
    setStartDate: (d: Date) => void
    setEndDate: (d: Date) => void
}): ReactNode => {
    let {startDate, endDate, setStartDate, setEndDate} = props;

    return <div className="row ms-1 my-2">
        <div className="col-auto">
            <label className="col-form-label" htmlFor="trans-start-date-input">Start Date:</label>
        </div>
        <div className="col-auto">
            <input className="form-control" id="trans-start-date-input" type="date"
                   value={formatDate8601(startDate)}
                   onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(from8601(e.target.value))}
            />
        </div>
        <div className="col-auto">
            <label className="col-form-label" htmlFor="trans-end-date-input">End Date:</label>
        </div>
        <div className="col-auto">
            <input className="form-control" id="trans-end-date-input" type="date"
                   value={formatDate8601(endDate)}
                   onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(from8601(e.target.value))}
            />
        </div>
    </div>;
}

const TransactionSymbolPicker = (props: {
    symbols: string[],
    filterSymbol: string,
    setFilterSymbol: (s: string) => void
}): ReactNode => {
    let {symbols, filterSymbol, setFilterSymbol} = props;

    const onChange = (ev: ChangeEvent<HTMLSelectElement>) => {
        setFilterSymbol(ev.target.value);
    };

    return <div><select className="form-select" onChange={onChange}>
        {symbols.map(symbol => <option key={symbol} value={symbol}
                                       selected={filterSymbol === symbol}>{symbol === "" ? "Filter by symbol" : symbol}</option>)}
    </select></div>;
}

function getPreviousSaturday(): Date {
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)

    // Calculate days to subtract to reach the previous Saturday
    let daysToSubtract;
    if (currentDay === 6) { // Today is Saturday
        daysToSubtract = 7;
    } else {
        daysToSubtract = (currentDay + 1) % 7;
    }

    // Weird exception, if today is Sunday or Monday, then we want TWO Saturday's ago.
    if (currentDay == 0 || currentDay == 1) {
        daysToSubtract += 7;
    }

    // Create a new Date object for the previous Saturday
    const previousSaturday = new Date(today);
    previousSaturday.setDate(today.getDate() - daysToSubtract);

    return previousSaturday;
}

export default function TransactionList() {
    let [currentAccount] = useContext(AccountContext);

    let today = new Date();
    let previousSaturday = getPreviousSaturday();
    let [transactionListResponse, setTransactionListResponse] = useState<TransactionListResponse | undefined>(undefined);
    let [startDate, setStartDate] = useState(previousSaturday);
    let [endDate, setEndDate] = useState(today);
    let [filterDescription, setFilterDescription] = useState<FilterDescription>({
        showDividends: true,
        showAdjustments: false,
        showInterest: false,
        showOptionsOnly: false,
        filterSymbol: "",
    });
    let [symbols, setSymbols] = useState<string[]>([]);
    let [optionSymbols, setOptionSymbols] = useState<Set<string>>(new Set<string>());
    let config = useContext(ConfigContext);

    useEffect(() => {
        if (!currentAccount) {
            return;
        }
        if (startDate >= endDate) {
            return;
        }
        const url = `${config.server_self_url}api/transactions/${currentAccount.accountIdKey}?startDate=${formatDateEtrade(startDate)}&endDate=${formatDateEtrade(endDate)}`;
        fetch(url)
            .then(r => r.json())
            .then(j => {
                let transaction_list_response = j as TransactionListResponse;
                transaction_list_response.Transaction = combineThings(transaction_list_response.Transaction);
                setTransactionListResponse(transaction_list_response);
            });
    }, [currentAccount, startDate, endDate]);

    useEffect(() => {
        let symbolSet = new Set<string>();
        let optionSymbolSet = new Set<string>();
        // ensure that "" is in the list, so that we can clear the selection.
        symbolSet.add("");
        transactionListResponse?.Transaction.map(t => {
            let s = t.brokerage?.product?.symbol?.trim();
            if (s && s !== "") {
                symbolSet.add(s);
            }
            if (t.brokerage?.product?.securityType === "OPTN") {
                optionSymbolSet.add(s);
            }
        });
        const symbols = Array.from(symbolSet).sort();
        setSymbols(symbols);
        setOptionSymbols(optionSymbolSet);
    }, [transactionListResponse]);

    const filterFunc = (txn: Transaction): boolean => {
        // If showOptionsOnly is true, then we only show options transactions which means:
        // - no adjustments, no interest.
        // - dividends are okay.
        // - only show transactions with symbols in the optionSymbols set.
        if (filterDescription.showOptionsOnly && !optionSymbols.has(txn.brokerage.product?.symbol?.trim())) {
            return false;
        }

        if (txn.transactionType === "Dividend" && (!filterDescription.showDividends && !filterDescription.showOptionsOnly)) {
            return false;
        }
        if (txn.transactionType === "Adjustment" && (!filterDescription.showAdjustments || filterDescription.showOptionsOnly)) {
            return false;
        }
        if (txn.transactionType === "Interest" && (!filterDescription.showInterest || filterDescription.showOptionsOnly)) {
            return false;
        }

        return !(filterDescription.filterSymbol !== "" && txn.brokerage.product?.symbol?.trim() !== filterDescription.filterSymbol);
    };

    const combineThings = (txns: Transaction[]): Transaction[] => {
        let combined: Transaction[] = [];

        txns.sort((t1, t2) => {
            // We are reverse sorting by date.
            const dateCmp = t1.transactionDate - t2.transactionDate;
            if (dateCmp !== 0) {
                return -dateCmp;
            }

            const t1product = formatProduct(t1.brokerage.product);
            const t2product = formatProduct(t2.brokerage.product);
            if (t1product === undefined && t2product === undefined) {
                return 0;
            }
            if (t1product === undefined) {
                return -1;
            }
            if (t2product === undefined) {
                return 1;
            }
            return t1product.localeCompare(t2product);
        });

        let lastTxn: (Transaction | undefined) = undefined;
        txns.forEach(txn => {
            if (lastTxn &&
                lastTxn.transactionDate === txn.transactionDate &&
                lastTxn.brokerage?.product &&
                formatProduct(lastTxn.brokerage.product) === formatProduct(txn.brokerage.product)) {
                lastTxn.amount += txn.amount;
                lastTxn.brokerage.quantity += txn.brokerage.quantity;
                // HACK: stop mutating the description, #23
                if (!lastTxn.description.startsWith("Combined ")) {
                    lastTxn.description = `Combined ${lastTxn.description}`;
                }
            } else {
                lastTxn = txn;
                combined.push(txn);
            }
        });
        return combined;
    }


    return <>
        <TransactionDatePicker startDate={startDate} endDate={endDate}
                               setStartDate={setStartDate} setEndDate={setEndDate}/>
        <TransactionSymbolPicker symbols={symbols} filterSymbol={filterDescription.filterSymbol}
                                 setFilterSymbol={(s: string) => {
                                     setFilterDescription({...filterDescription, filterSymbol: s});
                                 }}/>
        <TransactionFilterPicker filterDescription={filterDescription} setFilterDescription={setFilterDescription}/>
        <TransactionTable transactionList={transactionListResponse?.Transaction} filterFunc={filterFunc}/>
    </>;
}

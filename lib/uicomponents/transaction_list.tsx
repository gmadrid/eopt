import {ChangeEvent, ReactNode, useContext, useEffect, useState} from "react";
import {AccountContext} from "@/lib/uicomponents/contexts/account_context";
import {Transaction, TransactionListResponse} from "@/lib/etradeclient";
import {formatCurrency, formatDate, formatDate8601, formatDateEtrade, formatProduct, from8601} from "@/lib/format";
import {Col, Row} from "react-bootstrap";

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
}

const TransactionFilterPicker = (props: {
    filterDescription: FilterDescription,
    setFilterDescription: (filterDescription: FilterDescription) => void
}) => {
    const {filterDescription, setFilterDescription} = props;

    return <Row className="my-3">
        <Col xs="auto">
            <LabelledCheck label="Show Dividends" checkboxId="filter-dividends"
                           checked={filterDescription.showDividends}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => {
                               setFilterDescription({...filterDescription, showDividends: e.target.checked});
                           }}
            />
        </Col>
        <Col xs="auto">
            <LabelledCheck label="Show Adjustments" checkboxId="filter-adj" checked={filterDescription.showAdjustments}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => {
                               setFilterDescription({...filterDescription, showAdjustments: e.target.checked});
                           }}
            />
        </Col>
        <Col xs="auto">
            <LabelledCheck label="Show Interest" checkboxId="filter-int" checked={filterDescription.showInterest}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => {
                               setFilterDescription({...filterDescription, showInterest: e.target.checked});
                           }}
            />
        </Col>
        <Col xs="auto">
            <LabelledCheck label="Only Options-related" checkboxId="filter-optonly"
                           checked={filterDescription.showOptionsOnly}
                           disabled={true}
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
        <tbody>
        {transactionList.filter(filterFunc).map((transaction) => {
            return <tr key={transaction.transactionId}>
                <td className="ps-2">{formatDate(transaction.transactionDate)}</td>
                <td className="ps-2">{formatProduct(transaction.brokerage.product)}</td>
                <td className="ps-2">{transaction.transactionType}</td>
                <td className="ps-2 text-end">{formatCurrency(transaction.amount)}</td>
            </tr>;
        })}
        </tbody>
    </table>
}

export default function TransactionList() {
    let [accountIdKey] = useContext(AccountContext);

    let today = new Date();
    // TODO: make these default dates be "this week"
    let threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    let [transactionListResponse, setTransactionListResponse] = useState<TransactionListResponse | undefined>(undefined);
    // TODO: make sure that start < end.
    let [startDate, setStartDate] = useState(threeDaysAgo);
    let [endDate, setEndDate] = useState(today);
    let [filterDescription, setFilterDescription] = useState<FilterDescription>({
        showDividends: true,
        showAdjustments: true,
        showInterest: true,
        showOptionsOnly: false
    });

    useEffect(() => {
        if (!accountIdKey) {
            return;
        }
        if (startDate >= endDate) {
            return;
        }
        const url = `http://localhost:3333/api/transactions/${accountIdKey}?startDate=${formatDateEtrade(startDate)}&endDate=${formatDateEtrade(endDate)}`;
        console.log("URL: ", url);
        fetch(url)
            .then(r => r.json())
            .then(j => {
                setTransactionListResponse(j as TransactionListResponse);
            });
    }, [accountIdKey, startDate, endDate]);

    const filterFunc = (txn: Transaction): boolean => {
        if (txn.transactionType === "Dividend" && !filterDescription.showDividends) {
            return false;
        }
        if (txn.transactionType === "Adjustment" && !filterDescription.showAdjustments) {
            return false;
        }
        if (txn.transactionType === "Interest" && !filterDescription.showInterest) {
            return false;
        }
        // TODO: optionsOnly
        return true;
    };

    return <>
        <h2 className="pt-3">Transaction List</h2>
        <TransactionDatePicker startDate={startDate} endDate={endDate}
                               setStartDate={setStartDate} setEndDate={setEndDate}/>
        <TransactionFilterPicker filterDescription={filterDescription} setFilterDescription={setFilterDescription}/>
        <TransactionTable transactionList={transactionListResponse?.Transaction} filterFunc={filterFunc}/>
    </>;
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

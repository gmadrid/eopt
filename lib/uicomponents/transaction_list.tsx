import {ChangeEvent, useContext, useEffect, useState} from "react";
import {AccountContext} from "@/lib/uicomponents/contexts/account_context";
import {TransactionListResponse} from "@/lib/etradeclient";
import {formatCurrency, formatDate, formatDate8601, formatDateEtrade, formatProduct} from "@/lib/format";

export default function TransactionList() {
    let [accountIdKey] = useContext(AccountContext);

    let today = new Date();
    // TODO: make these default dates be "this week"
    let threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    let [transactionListResponse, setTransactionListResponse] = useState<TransactionListResponse | undefined>(undefined);
    let [startDate, setStartDate] = useState(threeDaysAgo);
    let [endDate, setEndDate] = useState(today);

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

    // TODO: make sure that start < end.
    const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        let utcDate = new Date(e.target.value);
        let theDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
        setStartDate(theDate);
    }

    const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        let utcDate = new Date(e.target.value);
        let theDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
        setEndDate(theDate);
    }

    return <>
        <h2 className="pt-3">Transaction List</h2>
        <div className="ms-1 my-2">
            <label>Start Date:</label>
            <input type="date" value={formatDate8601(startDate)} onChange={handleStartDateChange}/>
            <label>End Date:</label>
            <input type="date" value={formatDate8601(endDate)} onChange={handleEndDateChange}/>
        </div>
        <table className="ms-1">
            <tbody>
            {transactionListResponse?.Transaction.filter((t) => {
                return t.transactionType !== 'Adjustment';
            }).map((transaction) => {
                return <tr key={transaction.transactionId}>
                    <td className="ps-2">{formatDate(transaction.transactionDate)}</td>
                    <td className="ps-2">{formatProduct(transaction.brokerage.product)}</td>
                    <td className="ps-2">{transaction.transactionType}</td>
                    <td className="ps-2 text-end">{formatCurrency(transaction.amount)}</td>
                </tr>;
            })}
            </tbody>
        </table>
    </>;
}
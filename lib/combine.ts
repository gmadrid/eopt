import {Transaction} from "@/lib/etradeclient";
import {formatProduct} from "@/lib/format";

export interface CombinedTransaction {
    combined: boolean | undefined,
}

// Combine transactions that are on the same day and for the same product.
// As a side-effect, sorts the transactions by date and product.
// Adds a 'combined' field to the transactions that were combined.
const combineTransactions = (txns: Transaction[]): (Transaction & CombinedTransaction)[] => {
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
            (lastTxn as Transaction & CombinedTransaction).combined = true;
        } else {
            lastTxn = txn;
            combined.push(txn);
        }
    });
    return combined as (Transaction & CombinedTransaction)[];
}

export default combineTransactions;
import {Product, Transaction} from "@/lib/etradeclient";

export interface CombinedTransaction {
    combined: boolean | undefined,
}

// Combine transactions that are on the same day and for the same product.
// As a side effect, sorts the transactions by date and product.
// Adds a 'combined' field to the transactions that were combined.
const combineTransactions = (txns: Transaction[]): (Transaction & CombinedTransaction)[] => {
    let combined: Transaction[] = [];

    txns.sort((t1, t2) => {
        // We are reverse sorting by date.
        const dateCmp = t1.transactionDate - t2.transactionDate;
        if (dateCmp !== 0) {
            return -dateCmp;
        }

        return compareProducts(t1.brokerage.product, t2.brokerage.product);
    });

    let lastTxn: (Transaction | undefined) = undefined;
    txns.forEach(txn => {
        if (lastTxn &&
            lastTxn.transactionDate === txn.transactionDate &&
            productsEqual(lastTxn.brokerage?.product, txn.brokerage?.product)) {
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

export const compareProducts = (lhs?: Product, rhs?: Product): number => {
    if (lhs == rhs) {
        return 0;
    }
    if (lhs == undefined) {
        return -1;
    }
    if (rhs == undefined) {
        return 1;
    }
    let cmp = compareNullishStrings(lhs.symbol, rhs.symbol);
    if (cmp !== 0) {
        return cmp;
    }

    cmp = (lhs.expiryYear ?? 0) - (rhs.expiryYear ?? 0);
    if (cmp !== 0) {
        return cmp;
    }
    cmp = (lhs.expiryMonth ?? -1) - (rhs.expiryMonth ?? -1);
    if (cmp !== 0) {
        return cmp;
    }
    cmp = (lhs.expiryDay ?? -1) - (rhs.expiryDay ?? -1);
    if (cmp !== 0) {
        return cmp;
    }

    cmp = compareNullishStrings(lhs.securityType, rhs.securityType);
    if (cmp !== 0) {
        return cmp;
    }

    cmp = compareNullishStrings(lhs.callPut, rhs.callPut);
    if (cmp !== 0) {
        return cmp;
    }

    cmp = (lhs.strikePrice ?? 0) - (rhs.strikePrice ?? 0);
    return cmp;
}

const compareNullishStrings = (lhs?: string, rhs?: string): number => {
    return (lhs ?? '').localeCompare((rhs ?? ''));
}

const productsEqual = (lp?: Product, rp?: Product): boolean =>
    lp?.expiryDay === rp?.expiryDay &&
    lp?.expiryMonth === rp?.expiryMonth &&
    lp?.expiryYear === rp?.expiryYear &&
    lp?.strikePrice === rp?.strikePrice &&
    lp?.securityType === rp?.securityType &&
    lp?.symbol === rp?.symbol &&
    lp?.callPut === rp?.callPut;

export default combineTransactions;
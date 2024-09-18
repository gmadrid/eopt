import {Position} from "@/lib/etradeclient";

interface Strategy {
    // One of "Covered Call", "Bull Call Spread", "Covered Put", "Synthetic Long"
    strategyType: string,

    // For
    //   Covered Call: 1 stock
    position1: Position,

    // For
    //   Covered Call: 1 call
    position2: Position | null,
}

// returns a tuple of two arrays: the first array is the positions that are not part of any strategy, and the second array is the strategies
const findStrategies = (positions: Position[]): [Position[], Strategy[]] => {
    // make a copy of the input array so we can modify it
    let remaining = [...positions];
    const strategies: Strategy[] = [];

    find_covered_calls(remaining, strategies);
    find_bull_call_spreads(remaining, strategies);
    find_covered_puts(remaining, strategies);
    find_synthetic_longs(remaining, strategies);
    find_pure_stock(remaining, strategies);

    return [remaining, strategies];
}

export const POSITION_TYPE_STOCK = "EQ";
const POSITION_TYPE_OPTION = "OPTN";
const OPTION_TYPE_CALL = "CALL";
const OPTION_TYPE_PUT = "PUT";

const find_covered_calls = (positions: Position[], strategies: Strategy[]) => {
    const stockIndex = find_position(positions, POSITION_TYPE_STOCK);
    if (stockIndex === -1) {
        return;
    }

    const stock = positions[stockIndex];
    if (stock.quantity < 100) {
        // Less than 100 shares, can't do a covered call
        return;
    }


    const seeking_quantity = -(stock.quantity / 100);
    let optionIndex = find_position(positions, POSITION_TYPE_OPTION, OPTION_TYPE_CALL,
        seeking_quantity);
    if (optionIndex === -1) {
        return;
    }
    const option = positions[optionIndex];

    // remove these in reverse order so that the indexes don't change before use.
    positions.splice(Math.max(stockIndex, optionIndex), 1);
    positions.splice(Math.min(stockIndex, optionIndex), 1);

    strategies.push({
        strategyType: "Covered Call",
        position1: stock,
        position2: option,
    });
}

const expiryEqual = (lhs: Position, rhs: Position): boolean => {
    const lhp = lhs.Product;
    const rhp = rhs.Product;
    return lhp.expiryYear === rhp.expiryYear && lhp.expiryMonth === rhp.expiryMonth && lhp.expiryDay === rhp.expiryDay;
}

const find_bull_call_spreads = (positions: Position[], strategies: Strategy[]) => {
    const longs = positions.filter(position => position.Product.callPut === OPTION_TYPE_CALL && position.quantity > 0);
    const shorts = positions.filter(position => position.Product.callPut === OPTION_TYPE_CALL && position.quantity < 0);

    longs.forEach(long => {
        const short = shorts.find(short => expiryEqual(long, short) && short.Product.strikePrice > long.Product.strikePrice
            && long.quantity === -short.quantity);

        if (short) {
            strategies.push({
                strategyType: "Bull Call Spread",
                position1: long,
                position2: short,
            });

            positions.splice(positions.indexOf(long), 1);
            positions.splice(positions.indexOf(short), 1);
        }
    });
}

const find_covered_puts = (positions: Position[], strategies: Strategy[]) => {
    // looking for long puts with matching short puts:
    // - long expiry is after or equal to the short expiry
    // - the quantities have opposite signs with same abs value.
    const longs = positions.filter(position => position.Product.callPut === OPTION_TYPE_PUT && position.quantity > 0);
    const shorts = positions.filter(position => position.Product.callPut === OPTION_TYPE_PUT && position.quantity < 0);

    longs.forEach(long => {
        // the short put should expire before or at the same time as the long put.
        const short = shorts.find((short) =>
            compareExpiry(short, long) <= 0 &&
            short.quantity === -long.quantity
        );

        if (short) {
            strategies.push({
                strategyType: "Covered Put",
                position1: long,
                position2: short,
            });

            positions.splice(positions.indexOf(long), 1);
            positions.splice(positions.indexOf(short), 1);
        }
    });
}

const compareExpiry = (lhs: Position, rhs: Position): number => {
    const lhp = lhs.Product;
    const rhp = rhs.Product;

    if (lhp.expiryYear !== rhp.expiryYear) {
        return lhp.expiryYear - rhp.expiryYear;
    }

    if (lhp.expiryMonth !== rhp.expiryMonth) {
        return lhp.expiryMonth - rhp.expiryMonth;
    }

    return lhp.expiryDay - rhp.expiryDay;
}

const find_synthetic_longs = (positions: Position[], strategies: Strategy[]) => {
    // looking for matching long CALL and short PUT.
    const calls = positions.filter(position => position.Product.callPut === OPTION_TYPE_CALL && position.quantity > 0);
    const puts = positions.filter(position => position.Product.callPut === OPTION_TYPE_PUT && position.quantity < 0);

    calls.forEach(call => {
        const put = puts.find(put => expiryEqual(call, put) && call.Product.strikePrice === put.Product.strikePrice
            && call.quantity === -put.quantity);

        if (put) {
            strategies.push({
                strategyType: "Synthetic Long",
                position1: call,
                position2: put,
            });

            positions.splice(positions.indexOf(call), 1);
            positions.splice(positions.indexOf(put), 1);
        }
    });
}

const find_pure_stock = (positions: Position[], strategies: Strategy[]) => {
    // If there is only one position left and it is a stock,
    // then all of the options were swallowed up by strategies.
    // So, the stock that remains is a pure stock play.
    if (positions.length === 1 && positions[0].Product.securityType === POSITION_TYPE_STOCK) {
        // We unshift so that the pure stock strategy is the first one in the list.
        strategies.unshift({
            strategyType: "Stock",
            position1: positions[0],
            position2: null,
        });
        positions.splice(0, 1);
    }
}

const find_position = (positions: Position[], securityType: string,
                       optionType?: string, quantity?: number): number => {
    // For now, if searching for a stock, we don't care about the quantity.
    if (securityType === POSITION_TYPE_STOCK) {
        return positions.findIndex(position => position.Product.securityType === securityType);
    }

    if (!optionType) {
        throw new Error("Option type is required when searching for an option");
    }

    return positions.findIndex(position => position.Product.securityType === securityType &&
        position.Product.callPut === optionType &&
        (!quantity === undefined || position.quantity === quantity));
}

export default findStrategies;
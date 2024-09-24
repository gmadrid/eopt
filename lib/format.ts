import {Product} from "@/lib/etradeclient";

export function formatCurrency(amount?: number, currencyCode: string = 'USD', locale: string = 'en-US'): string {
    if (amount === undefined) {
        return '';
    }

    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
    });

    return formatter.format(amount);
}

export const formatProduct = (product?: Product): string => {
    if (!product) {
        return '';
    }

    if (product.securityType === 'OPTN') {
        let date_string = formatDate(product.expiryYear + 2000, product.expiryMonth, product.expiryDay);
        return `${product.symbol} ${date_string} \$${product.strikePrice} ${product.callPut}`;
    } else {
        return product.symbol;
    }
}

export function formatDate(year: number | Date, month?: number, day?: number): string {
    // Note: Months are 0-indexed in JavaScript
    const date = month === undefined ? year as Date : new Date(year as number, month - 1, day);

    const formatter = new Intl.DateTimeFormat('en-US', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
    });
    return formatter.format(date);
}

export const formatDate8601 = (date: Date): string => {
    const year = date.getFullYear();
    // Months are 0-indexed
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export const formatDateEtrade = (date: Date): string => {
    const year = date.getFullYear();
    // Months are 0-indexed
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${month}${day}${year}`;
}

export const from8601 = (dateString: string): Date => {
    // For "date-only" dates, we need to add the timezone offset to get the correct date for localtime.
    let utcDate = new Date(dateString);
    return new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
}

export const formatDateShort = (date: Date | number): string => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
    });

    return formatter.format(date);
}

export const formatPercent = (percent: number): string => {
    return `${percent.toFixed(2)}%`;
}
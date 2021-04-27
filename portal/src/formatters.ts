import {format, formatDistance} from 'date-fns';
import {es} from 'date-fns/locale';

export function abs(value?: number) {
    if (value === undefined || value === null) {
        return '';
    }
    if (isNaN(value)) {
        return '';
    }
    return Math.abs(value);
}

export function secondsToDate(seconds?: number) {
    if (seconds === undefined) return '';
    const asNumber = seconds;
    if (isNaN(asNumber)) {
        return '';
    }
    const finalSeconds = asNumber % 60;
    const finalMinutes = ((asNumber - finalSeconds) % 3600) / 60;
    const finalHours = parseInt(`${asNumber / 3600}`, 10);

    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${pad(finalHours)}:${pad(finalMinutes)}:${pad(finalSeconds)}`;
}

export function formatMoney(value: any, symbol?: string, decimalDigits?: number) {
    if (!value && value !== 0) return '';
    if (typeof value === 'string' && symbol && value.startsWith(symbol)) return value;

    const amount = decimalDigits ? value : Math.round(value);
    const formattedAmount = new Intl.NumberFormat('it', {
        minimumFractionDigits: decimalDigits || 0,
        maximumFractionDigits: decimalDigits || 0
    }).format(amount);
    const prefix = symbol !== undefined ? `${symbol} ` : '';
    return `${prefix}${formattedAmount}`;
}

export function formatNumber(value: any, decimalDigits: number = 0) {
    if (value !== 0 && !value) return '';
    if (typeof value === 'string') value = parseFloat(value);

    const amount = decimalDigits ? value : Math.round(value);
    return new Intl.NumberFormat('it', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimalDigits
    }).format(amount);
}


export function formatIsoDate(value: any) {
    if (value) {
        return format(new Date(value), 'dd/MM/yyyy', {locale: es});
    }

    return '';
}

export function formatToYear(value: any) {
    return formatWF(value, "yyyy");
}

export function formatToMonth(value: any) {
    return formatWF(value, "MMMM 'de' yyyy");
}

export function formatToDay(value: any) {
    return formatWF(value, "dd 'de' MMMM 'de' yyyy");
}

export function formatWF(value: any, f: string) {
    if (value) {
        const date = value.split("T")[0].split('-');
        return format(new Date(Date.UTC(Number(date[0]), Number(date[1]) -1, Number(date[2]) +1)), f, {locale: es});
    }

    return '';
}

export function formatSortableDate(value: any) {
    if (value) {
        return format(new Date(value), 'yyyy/MM/dd', {locale: es});
    }
    return '';
}

export function formatIsoDateTime(value: any) {
    if (value) {
        return format(new Date(value), 'dd/MM/yyyy HH:mm:ss', {locale: es});
    }

    return '';
}

export function formatIsoTime(value: any) {
    if (value) {
        return format(new Date(value), 'HH:mm:ss', {locale: es});
    }

    return '';
}

export function formatSecondsDuration(seconds: number) {
    const prefix = seconds < 0 ? "-" : "";
    return prefix + formatDistance(0, seconds * 1000, {includeSeconds: true, locale: es})
}

export function getInitials(name: string) {
    const split = name.split(" ");
    let initials = "";
    split.forEach(s => initials = initials + s.substr(0, 1));
    return initials;
}


export function millionFormatter(num: any) {
    if (typeof num !== 'number') return '';
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'Mil M';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    return num;
}

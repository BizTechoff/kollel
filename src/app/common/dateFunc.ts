import { isBackend } from "remult"

export class DayOfWeek {
    static sunday = new DayOfWeek('ראשון', 0)
    static monday = new DayOfWeek('שני', 1)
    static tuesday = new DayOfWeek('שלישי', 2)
    static wednesday = new DayOfWeek('רביעי', 3)
    static thursday = new DayOfWeek('חמישי', 4)
    static friday = new DayOfWeek('שישי', 5)
    static saturday = new DayOfWeek('שבת', 6)
    constructor(public caption = '', public value = 0) { }
    static getValueOf(dow: DayOfWeek) {
        return dow.value
    }
    static getCaptionOf(dow: DayOfWeek) {
        return dow.caption
    }
}

export const dayOfCreatingVisits = DayOfWeek.sunday
export const dayOfHomeVisits = DayOfWeek.thursday

export function firstDateOfWeek(date: Date) {
    for (let i = 0; i < 7; ++i) {
        let day = date.getDay()
        if (day === dayOfCreatingVisits.value) {
            break
        }
        date = resetDateTime(new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() - 1));
    }
    return date
}

export function lastDateOfWeek(date: Date) {
    date = firstDateOfWeek(date)
    return resetDateTime(new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 7 - 1));
}

export function firstDateOfWeekByHomeVisit(date: Date) {
    let day = date.getDay()
    if (day < dayOfHomeVisits.value) {
        date = resetDateTime(new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() - day));
    }
    return firstDateOfWeek(date)
}

export function firstDateOfMonth(date: Date) {
    return resetDateTime(new Date(
        date.getFullYear(),
        date.getMonth(),
        1));
}

export function lastDateOfMonth(date: Date) {
    let first = firstDateOfMonth(date)
    let next = resetDateTime(new Date(
        first.getFullYear(),
        first.getMonth() + 1,
        1));
    return resetDateTime(new Date(
        next.getFullYear(),
        next.getMonth(),
        next.getDate() - 1));
}

export function dateFormat(date: Date, delimiter = '/') {
    let result = ''
    if (date) {
        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()

        result += ('00' + day).slice(-2)
        result += delimiter
        result += ('00' + month).slice(-2)
        result += delimiter
        result += year
    }
    return result
}

export function calculateDiff(data1: Date, date2: Date) {
    let days = Math.floor((data1.getTime() - date2.getTime()) / 1000 / 60 / 60 / 24);
    return days;
}

export function dateEquals(date1: Date, date2: Date) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
}

export function monthOfYear(data: Date) {
    return data.getMonth() + 1
}

export function weekOfYear(data: Date) {
    let startDate = new Date(data.getFullYear(), 0, 1);
    var days = calculateDiff(data, startDate)
    return Math.ceil(days / 7);
}

export function dayOfMonth(data: Date) {
    return data.getDate()
}


export function resetDateTime(date = new Date(), days = 0) {
    if (!date) {
        // console.log('resetDateTime date = NULL !! ')
        date = new Date()
    }
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + days,
        0,
        isBackend() ? date.getTimezoneOffset() * -1 : 0,
        0);
}

export function dateDiff(d1: Date, d2: Date) {

    let timeDifference = Math.abs(d1.getTime() - d2.getTime());
    let differentDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return differentDays
}

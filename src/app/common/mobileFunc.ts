

export const isValidMobile = (mobile = '') => {
    if (!mobile) {
        return false;
    }
    mobile = mobile.trim()
    for (let i of [1, 2, 3, 4, 5]) {
        mobile = mobile.replace('-', '')
    }
    if (!mobile.length) {
        return false
    }
    let result =
        (
            mobile.length === 10
            &&
            mobile.startsWith('05')
        ) 
        ||
        (
            mobile.length === 11
            &&
            mobile.startsWith('1')
        )
    return result
}

export const mobileFromDb = (mobile: string) => {
    let result = '';// [0]00-0000-000
    if (mobile && mobile.length > 0) {
        let last = mobile.length - 3;
        if (last > 0) {
            result = mobile.substring(0, last) + '-' + mobile.substring(last);

            let first = result.length - 7 - 1;//'-'
            if (first > 0) {
                result = result.substring(0, first) + '-' + result.substring(first);
            }
        }
    }
    return result;
}

export const mobileToDb = (mobile: string, mobile2?: string): boolean | string => {
    let digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let fixedMobile = '';// [0]000000000
    if (mobile && mobile.length > 0) {
        for (const c of mobile) {
            if (digits.includes(c)) {
                fixedMobile += c;
            }
        }
    }
    if (fixedMobile.length > 0) {
        fixedMobile = fixedMobile.padStart(10, '0');
        if (!fixedMobile.startsWith('05')) {
            if (!fixedMobile.startsWith('000')) {
                if (fixedMobile.startsWith('00')) {
                    fixedMobile = fixedMobile.substring(1);//02,03,..
                }
            }
        }
    }

    if (mobile2 && mobile2.length > 0) {
        let fixedMobile2 = '';// [0]000000000
        for (const c of mobile2) {
            if (digits.includes(c)) {
                fixedMobile2 += c;
            }
        }
        if (fixedMobile2.length > 0) {
            fixedMobile2 = fixedMobile2.padStart(10, '0');
            if (!fixedMobile2.startsWith('05')) {
                if (!fixedMobile2.startsWith('000')) {
                    if (fixedMobile2.startsWith('00')) {
                        fixedMobile2 = fixedMobile2.substring(1);//02,03,..
                    }
                }
            }
        }

        return fixedMobile === fixedMobile2
    }

    return fixedMobile;
}
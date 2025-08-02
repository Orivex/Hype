export function timeToString(time, isInMillis) {
    let seconds = time;
    if(isInMillis) {
        seconds = Math.round(time/1000);
    }

    if(seconds <= 60) {
        return seconds + 'sec';
    }
    else if(seconds <= 3600) {
        return (Math.round(seconds/60)) + 'min';
    }
    else if(seconds <= 86400) {
        return (Math.round(seconds/3600)) + "hr";
    }
    else if(seconds <= 604800) {
        return (Math.round(seconds/86400)) + 'd';
    }
    else if(seconds <= 2419200) {
        return (Math.round(seconds/604800)) + 'wk';
    }
    else if(seconds <= 29030400) {
        return (Math.round(seconds/2419200)) + 'mo';
    }
    else {
        return (Math.round(seconds/29030400)) + 'yr';
    }

}
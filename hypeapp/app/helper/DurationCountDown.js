import { doc, getDoc, serverTimestamp, setDoc } from "@react-native-firebase/firestore";


let serverTimeOffset = 0;

export async function estimateServerTimeOffset (db){
    try {
        const serverTime = await getServerTimeMillis(db);
        const localTime = Date.now();
        serverTimeOffset = (serverTime - localTime);
    }
    catch(e) {
        console.error("Error when estimating server time offset: ", e);
    }
}

export { serverTimeOffset }

export async function getServerTimeMillis (db) {
    try {
        const tmpRef = doc(db, "tmp", "serverTimeTest");
        await setDoc(tmpRef, { serverTime: serverTimestamp()});
        const docSnap = await getDoc(tmpRef);
        const serverTime = docSnap.data().serverTime.toMillis();
        return serverTime;
    }
    catch(e) {
        console.error("Error when get server time stamp: ", e);
    }
}
export function calculateTimeLeft(seconds, startAt) {
    const remaining = (seconds * 1000) - ( (Date.now() + serverTimeOffset) - startAt);
    console.log(remaining);
    return Math.max(remaining, 0);
}

export function startCountDown(startAt, seconds, callback) {
    const endTime = startAt + seconds * 1000;

    const interval = setInterval(()=> {
        const remaining = Math.max(endTime - (Date.now() + serverTimeOffset), 0);
        const remainingSeconds = Math.floor(remaining/1000);
        callback(remainingSeconds)
        if(remainingSeconds <= 0) {
            clearInterval(interval);
        }
    }, 100);

    return () => clearInterval(interval)
}
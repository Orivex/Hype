import { doc, getDoc, serverTimestamp, setDoc } from "@react-native-firebase/firestore";

export async function estimateServerTimeOffeset (db){
    try {
        const tmpRef = doc(db, "tmp", "serverTimeTest");
        await setDoc(tmpRef, { serverTime: serverTimestamp()});
        const docSnap = await getDoc(tmpRef);
        const serverTime = docSnap.data().serverTime.toMillis();
        const localTime = Date.now();
        return (serverTime - localTime);
    }
    catch(e) {
        console.error("Error when estimating server time offset: ", e);
    }
}

export function calculateTimeLeft(seconds, startAt, serverTimeOffset) {
    return (seconds * 1000) - ( (Date.now() + serverTimeOffset) - startAt.toMillis());
}

export function startCountDown(startAt, seconds, serverTimeOffset, callback) {
    const interval = setInterval(()=> {
        const timeLeft = calculateTimeLeft(seconds, startAt, serverTimeOffset)
        if(timeLeft <= 0) {
            clearInterval(interval);
            callback(0);
        }
        else {
            callback(Math.floor(timeLeft/1000));
        }
    }, 100);

    return () => clearInterval(interval)
}
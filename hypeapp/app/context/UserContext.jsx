import { getAuth } from "@react-native-firebase/auth";
import { collection, doc, getFirestore, onSnapshot, getDoc } from "@react-native-firebase/firestore";

const { createContext, useEffect, useState, useContext } = require("react");

const UserContext  = createContext({

});

export const UserProvider = ({children}) => {

  const db = getFirestore();
  const userRef = collection(db, 'user');

    const [user, setUser] = useState(null);
    const [hypeScore, setHypeScore] = useState(0);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    const fetchHypeScore = () => {
      const docRef = doc(userRef, user.id);
      const unsub = onSnapshot(docRef, (docSnap) => {
        if(docSnap.exists()) {
          setHypeScore(docSnap.data().hype_score);
        }
      })

      return unsub; 
    }

    const fetchUser = async () => {
      const currentUser = getAuth().currentUser;
      if(!currentUser) {
        return;
      }

      try {
        const docSnap = await getDoc(doc(userRef, currentUser.uid));
        if(docSnap.exists()) {
          setUser({id: currentUser.uid, ...docSnap.data()});
        }
      }
      catch(e) {
        console.error("Error when fetching user: ", e);
      }

    }

    useEffect(()=> {

      const loadData = async () => {
        try {
          await fetchUser();
        }
        catch(e) {
          console.error("Error when loading data: ", e);
        }
        finally {
          setIsLoadingUser(false);
        }
      }

      loadData();

    }, [])

  useEffect(()=> {

    if(!isLoadingUser) {
      const unsub = fetchHypeScore();

      return () => {
        if(unsub) {
          unsub();
        }
      }
    }


  }, [isLoadingUser]);

    return (
      <UserContext.Provider value={{user, hypeScore, isLoadingUser}}>
        {children}
      </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext);
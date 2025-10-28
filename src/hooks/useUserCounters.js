import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useUserCounters(uid) {
    const [c, setC] = useState({ followersCount: 0, followingCount: 0 });
    
    useEffect(() => {
        if (!uid) return;
        return onSnapshot(doc(db, "users", uid), (snap) => {
            const d = snap.data() || {};
            setC({
                followersCount: d.followersCount || 0,
                followingCount: d.followingCount || 0,
            });
        });
    }, [uid]);
    return c;
}
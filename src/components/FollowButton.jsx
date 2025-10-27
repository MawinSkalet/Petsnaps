import React, { useEffect, useState } from "react";
import { followUser, unfollowUser, isFollowing } from "../services/socialApi";

export default function FollowButton({ me, target, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!me?.uid || !target?.uid || me.uid === target.uid) return;
      const ok = await isFollowing({ meUid: me.uid, targetUid: target.uid });
      if (mounted) setFollowing(ok);
    })();
    return () => (mounted = false);
  }, [me?.uid, target?.uid]);

  if (!me?.uid || !target?.uid || me.uid === target.uid) return null;

  async function toggle() {
    setLoading(true);
    try {
      if (following) {
        await unfollowUser({ meUid: me.uid, targetUid: target.uid });
        setFollowing(false);
      } else {
        await followUser({
          meUid: me.uid,
          meProfile: { displayName: me.displayName, photoURL: me.photoURL },
          targetUid: target.uid,
          targetProfile: { displayName: target.displayName, photoURL: target.photoURL },
        });
        setFollowing(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      disabled={loading}
      onClick={toggle}
      className={
        (following
          ? "bg-[#FFE7CC] border border-[#E2B887]/60 text-[#8B6F47]"
          : "bg-[#E2B887] text-white") +
        " px-3 py-1.5 rounded-full text-sm " + className
      }
    >
      {loading ? "…" : following ? "Following" : "Follow"}
    </button>
  );
}
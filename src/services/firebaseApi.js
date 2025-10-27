import { doc, updateDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore";
import { db } from "../firebase";

export async function updatePostLikes(postId, userId, alreadyLiked) {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    likedBy: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
    likeCount: increment(alreadyLiked ? -1 : 1),
  });
}

import { doc, updateDoc, arrayUnion, arrayRemove, increment, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function updatePostLikes(postId, userId, alreadyLiked) {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    likedBy: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
    likeCount: increment(alreadyLiked ? -1 : 1),
  });
}

export async function deletePost(postId) {
    const postRef = doc(db, "posts", postId);
    await deleteDoc(postRef);
}
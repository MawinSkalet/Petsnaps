import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export async function updatePostLikes(postId, userId, alreadyLiked) {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    likedBy: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
    likeCount: increment(alreadyLiked ? -1 : 1),
  });
}

export async function deletePost(postId) {
  try {
    const postRef = doc(db, "posts", postId);

    // Get the post to find the uid
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data();
      const uid = postData.uid;

      // Delete from both locations
      await deleteDoc(postRef); // Delete from /posts

      // Delete from /users/{uid}/posts/{postId} if exists
      if (uid) {
        const userPostRef = doc(db, "users", uid, "posts", postId);
        await deleteDoc(userPostRef).catch(() => {}); // Ignore if doesn't exist
      }
    } else {
      // If post doesn't exist in main collection, just try to delete it
      await deleteDoc(postRef);
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

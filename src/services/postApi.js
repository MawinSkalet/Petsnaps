import { db, storage } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";


export async function createPost({ uid, text = "", files = [], author = {} }) {
  if (!uid) throw new Error("Missing uid");
  if (!Array.isArray(files)) throw new Error("Files must be an array");

  // Limit to 10 images
  const limitedFiles = files.slice(0, 10);
  const urls = [];

  for (const f of limitedFiles) {
    const path = `posts/${uid}/${Date.now()}_${f.name}`;
    const r = ref(storage, path);
    await uploadBytes(r, f);
    const url = await getDownloadURL(r);
    urls.push(url);
  }

  const payload = {
    uid, // must equal request.auth.uid
    text: text.trim(),
    images: urls, // up to 10 URLs
    createdAt: serverTimestamp(),
    commentCount: 0,
    author: {
      uid,
      displayName: author.displayName || "",
      photoURL: author.photoURL || "",
    },
  };

  await addDoc(collection(db, "posts"), payload);
}
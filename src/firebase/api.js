import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./firebase";

// Auth API
export const signUp = async (email, password, petName) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const defaultPhotoURL = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${
    petName || userCredential.user.uid
  }`;
  await setDoc(doc(db, "users", userCredential.user.uid), {
    petName: petName || "New Pet",
    email: email,
    photoURL: defaultPhotoURL,
    friends: [],
    createdAt: serverTimestamp(),
  });
  return userCredential.user;
};

export const signIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

export const logout = async () => {
  await signOut(auth);
};

// Storage API
export const uploadFile = async (file, path) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// User API
export const getUserProfile = async (uid) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      id: uid,
      friends: Array.isArray(data.friends) ? data.friends : [],
      ...data,
    };
  }
  return null;
};

export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      friends: Array.isArray(data.friends) ? data.friends : [],
      ...data,
    };
  });
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), data);
};

// Post API
export const getPosts = async () => {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const addPost = async (postData) => {
  await addDoc(collection(db, "posts"), {
    ...postData,
    likes: 0,
    likedBy: [],
    createdAt: serverTimestamp(),
  });
};

export const deletePost = async (postId) => {
  await deleteDoc(doc(db, "posts", postId));
};

export const updatePostLikes = async (postId, userId, liked) => {
  const postRef = doc(db, "posts", postId);
  if (liked) {
    await updateDoc(postRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId),
    });
  } else {
    await updateDoc(postRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId),
    });
  }
};

// Friend Request API
export const sendFriendRequest = async (senderId, receiverId) => {
  await addDoc(collection(db, "friendRequests"), {
    senderId,
    receiverId,
    createdAt: serverTimestamp(),
  });
};

export const acceptFriendRequest = async (requestId, senderId, receiverId) => {
  await updateDoc(doc(db, "users", senderId), {
    friends: arrayUnion(receiverId),
  });
  await updateDoc(doc(db, "users", receiverId), {
    friends: arrayUnion(senderId),
  });
  await deleteDoc(doc(db, "friendRequests", requestId));
};

export const rejectFriendRequest = async (requestId) => {
  await deleteDoc(doc(db, "friendRequests", requestId));
};

export const listenForFriendRequests = (currentUserId, callback) => {
  const q = query(
    collection(db, "friendRequests"),
    where("receiverId", "==", currentUserId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, async (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const requestsWithSender = await Promise.all(
      requests.map(async (req) => {
        const senderDoc = await getDoc(doc(db, "users", req.senderId));
        const senderData = senderDoc.exists() ? senderDoc.data() : {};
        return {
          ...req,
          senderName: senderData.petName || "Unknown Pet",
          senderPhoto: senderData.photoURL || "",
        };
      })
    );
    callback(requestsWithSender);
  });
};

// Chat API
export const getChatId = (uid1, uid2) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

export const sendMessage = async (senderId, receiverId, text) => {
  const chatId = getChatId(senderId, receiverId);
  await addDoc(collection(db, "chats", chatId, "messages"), {
    text,
    senderId,
    receiverId,
    createdAt: serverTimestamp(),
  });
};

export const listenForMessages = (uid1, uid2, callback) => {
  const chatId = getChatId(uid1, uid2);
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const messagesData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messagesData);
  });
};

//  functions/index.js
const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

//  helper to build actor profile
async function actorInfo(uid) {
  const snap = await db.doc(`users/${uid}`).get();
  const d = snap.exists ? snap.data() : {};
  return {
    uid,
    name: d.displayName || d.petName || "Someone",
    avatar: d.photoURL || "",
  };
}

//  follow - notification id is follower uid (one per relation)
exports.onFollowCreate = functions.firestore.onDocumentCreated("follows/{targetUid}/followers/{followerUid}", async (event) => {
  const { targetUid, followerUid } = event.params;
  if (targetUid === followerUid) return;

  const actor = await actorInfo(followerUid);
  const notifRef = db.doc(`notifications/${targetUid}/items/${followerUid}`);
  await notifRef.set({
    type: "follow",
    actor,
    message: `${actor.name} started following you`,
    url: `/u/${followerUid}`,
    postId: null,
    postImage: null,
    commentText: null,
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
});

//  like handlers (create/delete)
exports.onLikeCreate = functions.firestore.onDocumentCreated("posts/{postId}/likes/{likerUid}", async (e) => {
  const { postId, likerUid } = e.params;
  const db = admin.firestore();
  const postSnap = await db.doc(`posts/${postId}`).get();
  if (!postSnap.exists) return;
  const post = postSnap.data();
  if (post.uid === likerUid) return; // don't notify self-like

  // increment likeCount
  await db.doc(`posts/${postId}`).update({
    likeCount: admin.firestore.FieldValue.increment(1),
  });

  // make notification (deterministic id)
  const actor = await actorInfo(likerUid);
  const postImage = Array.isArray(post.images) && post.images[0] ? post.images[0] : null;
  await db.doc(`notifications/${post.uid}/items/${postId}_${likerUid}`).set({
    source: "cf",
    type: "like",
    actor,
    message: `${actor.name} liked your post`,
    url: `/p/${postId}`,
    postId,
    postImage,
    commentText: null,
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
});

exports.onLikeDelete = functions.firestore.onDocumentDeleted("posts/{postId}/likes/{likerUid}", async (e) => {
  const { postId } = e.params;
  const db = admin.firestore();
  const postSnap = await db.doc(`posts/${postId}`).get();
  if (!postSnap.exists) return;

  await db.doc(`posts/${postId}`).update({
    likeCount: admin.firestore.FieldValue.increment(-1),
  });
});


//  comment - notification id is commentId (one per comment)
exports.onCommentCreate = functions.firestore.onDocumentCreated("posts/{postId}/comments/{commentId}", async (event) => {
  const { postId, commentId } = event.params;
  const c = event.data?.data();
  if (!c) return;

  const post = (await db.doc(`posts/${postId}`).get()).data();
  if (!post) return;
  if (post.uid === c.author?.uid) return; // don't notify self

  const actor = await actorInfo(c.author?.uid);
  const postImage = Array.isArray(post.images) && post.images[0] ? post.images[0] : null;
  const commentText = (c.text || "").slice(0, 280);

  const notifRef = db.doc(`notifications/${post.uid}/items/${commentId}`);
  await notifRef.set({
    type: "comment",
    actor,
    message: `${actor.name} commented on your post`,
    url: `/p/${postId}`,
    postId,
    postImage,
    commentText,
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
});

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { createPost } from "../services/postApi";
import { useNavigate } from "react-router-dom";

export default function AddPostPage() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [profile, setProfile] = useState(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      setProfile(
        snap.exists()
          ? snap.data()
          : { displayName: user.displayName || "", photoURL: user.photoURL || "" }
      );
    })();
  }, [user]);

  function onPick(e) {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 10) {
      alert("You can upload up to 10 images only.");
      e.target.value = ""; // reset input
      return;
    }
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!user) return setErr("Please sign in first.");
    if (!text.trim() && files.length === 0)
      return setErr("Please add some text or images.");
    setPosting(true);
    setErr("");

    try {
      await createPost({
        uid: user.uid,
        text,
        files,
        author: {
          uid: user.uid,
          displayName: profile?.displayName || "",
          photoURL: profile?.photoURL || "",
        },
      });
      nav(`/u/${user.uid}`);
    } catch (e2) {
      console.error(e2);
      setErr(e2.message || "Post failed");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FFE7CC] flex justify-center px-4 py-6">
      <form onSubmit={onSubmit} className="w-full max-w-xl bg-white/90 rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold text-[#8B6F47] mb-4">Create Post</h2>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Say something about your pet…"
          className="w-full min-h-[120px] p-3 rounded-xl border-2 border-[#E2B887]/40 focus:border-[#E2B887] outline-none mb-3"
        />

        <label
          htmlFor="pick-post-images"
          className="inline-block mb-3 px-3 py-1 rounded-full bg-[#FFE7CC] text-[#8B6F47] border border-[#E2B887]/60 cursor-pointer"
        >
          Add images
        </label>
        <input
          id="pick-post-images"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onPick}
        />

        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`preview-${i}`}
                className="aspect-square object-cover rounded-xl border"
              />
            ))}
          </div>
        )}

        {err && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-3 py-2">
            {err}
          </div>
        )}

        <button
          type="submit"
          disabled={posting}
          className="w-full py-3 rounded-2xl bg-[#E2B887] text-white font-semibold disabled:opacity-50"
        >
          {posting ? "Posting…" : "Post"}
        </button>
      </form>
    </div>
  );
}

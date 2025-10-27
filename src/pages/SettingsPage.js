import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth, db, storage } from "../firebase";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref as sref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function SettingsPage() {
  const { user, logout } = useAuth();         // real Firebase user
  const navigate = useNavigate();

  // form state
  const [petName, setPetName] = useState("");
  const [bio, setBio]       = useState("");
  const [email, setEmail]   = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [ok, setOk]         = useState("");

  // Load current profile from Auth + Firestore
  useEffect(() => {
    if (!user) return;
    setEmail(user.email || "");
    setPetName(user.displayName || "");
    setPhotoURL(user.photoURL || "");

    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const d = snap.data();
          if (d.displayName) setPetName(d.displayName);
          if (d.bio)         setBio(d.bio);
          if (d.photoURL)    setPhotoURL(d.photoURL);
        } else {
          // create minimal doc if missing
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            bio: "",
            createdAt: serverTimestamp(),
          });
        }
      } catch (e) {
        console.warn("settings load failed:", e);
      }
    })();
  }, [user]);

  // pick avatar
  function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  // save all changes
  async function onSave(e) {
    e?.preventDefault?.();
    if (!user) return;

    setSaving(true);
    setError("");
    setOk("");

    try {
      let newPhoto = photoURL;

      // upload avatar if chosen
      if (file) {
        const r = sref(storage, `profile/${user.uid}/avatar.jpg`);
        await uploadBytes(r, file);
        newPhoto = await getDownloadURL(r);
      }

      // update Firebase Auth displayName/photo
      await updateProfile(auth.currentUser, {
        displayName: petName || "",
        photoURL: newPhoto || "",
      });

      // update Firestore profile doc (source of truth for app)
      await updateDoc(doc(db, "users", user.uid), {
        displayName: petName || "",
        photoURL: newPhoto || "",
        bio: bio || "",
        updatedAt: serverTimestamp(),
      });

      setPhotoURL(newPhoto);
      setOk("Profile updated.");
      setFile(null);
      setPreview("");
    } catch (e) {
      setError(e.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-start justify-center p-6 bg-[#FFE7CC]">
      <form onSubmit={onSave} className="w-full max-w-md bg-white/90 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Settings</h2>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-[#F5F5F5] border">
            <img
              src={preview || photoURL || "https://i.pravatar.cc/96?img=3"}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <label
            htmlFor="pick-avatar"
            className="mt-3 px-3 py-1 rounded-full text-sm bg-[#FFE7CC] text-[#8B6F47] border border-[#E2B887]/60 cursor-pointer"
          >
            Change Photo
          </label>
          <input id="pick-avatar" type="file" accept="image/*" className="hidden" onChange={onPick} />
        </div>

        {/* Pet Name */}
        <label className="block text-sm text-[#8B6F47] mb-1">Pet Name</label>
        <input
          value={petName}
          onChange={(e) => setPetName(e.target.value)}
          className="w-full px-4 py-3 border-2 border-orange-200 rounded-2xl focus:border-orange-400 focus:outline-none transition bg-white/80 backdrop-blur mb-3"
          placeholder="Your pet's name"
        />

        {/* Bio */}
        <label className="block text-sm text-[#8B6F47] mb-1">Bio</label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full px-4 py-3 border-2 border-orange-200 rounded-2xl focus:border-orange-400 focus:outline-none transition bg-white/80 backdrop-blur mb-3"
          placeholder="A short bio…"
        />

        {/* Email (read-only) */}
        <label className="block text-sm text-[#8B6F47] mb-1">Email</label>
        <input
          value={email}
          readOnly
          className="w-full px-4 py-3 border-2 border-orange-100 rounded-2xl bg-gray-50 text-gray-500 mb-4"
        />

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-2">
            {error}
          </div>
        )}
        {ok && (
          <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-2xl px-4 py-2">
            {ok}
          </div>
        )}

        {/* Primary actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#E2B887] text-white py-3 rounded-2xl font-semibold hover:brightness-95 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="px-4 py-3 rounded-2xl border border-[#E2B887]/60 text-[#8B6F47] hover:bg-[#FFF1DF]"
            onClick={() => navigate("/profile")}
          >
            View Profile
          </button>
        </div>

        {/* Secondary */}
        <button
          type="button"
          onClick={logout}
          className="w-full mt-3 bg-red-500 text-white py-3 rounded-2xl font-semibold hover:brightness-95 transition"
        >
          Logout
        </button>
      </form>
    </div>
  );
}
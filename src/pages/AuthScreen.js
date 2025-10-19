import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import clsx from "clsx";
import {
  LoginFormComponent,
  RegisterFormComponent,
  AuthFormLayout,
} from "../components/AuthForms";
import { mockSignIn, mockSignUp } from "../services/mockApi";
import { useAuth } from "../context/AuthContext";

function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [petName, setPetName] = useState("");
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [isFlipped, setIsFlipped] = useState(false);
  const [isRegisterForm, setIsRegisterForm] = useState(false);

  const [introAnimationState, setIntroAnimationState] = useState("initial");
  const animatorStateClasses = {
    initial: "scale-150 ease-shrinker",
    shrinking: "scale-40 ease-shrinker",
    "small-circle": "scale-40 ease-shrinker",
    expanding: "scale-[30] ease-expander",
    finished: "scale-[30] opacity-0 pointer-events-none ease-expander",
  };

  const { user } = useAuth();

  useEffect(() => {
    console.log("AuthScreen: user state changed to", user);
    const timers = [];
    timers.push(setTimeout(() => setIntroAnimationState("shrinking"), 200));
    timers.push(setTimeout(() => setIntroAnimationState("small-circle"), 1200));
    timers.push(setTimeout(() => setIntroAnimationState("expanding"), 1700));
    timers.push(setTimeout(() => setIntroAnimationState("finished"), 2700));
    return () => timers.forEach(clearTimeout);
  }, [user]); // Add user to dependency array to log changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAuthLoading(true);
    try {
      if (isRegisterForm) {
        await mockSignUp(email, password, petName);
      } else {
        await mockSignIn(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/home" />;
  }

  return (
    <div className="min-h-screen bg-[#FFE7CC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Intro Animator (ถ้ายังใช้) */}
      <div
        className={clsx(
          "absolute top-1/2 left-1/2 z-20 w-[200px] h-[200px] rounded-full",
          "-translate-x-1/2 -translate-y-1/2",
          "transition-all duration-1000",
          "bg-[linear-gradient(135deg,_#b8d4e6_0%,_#ffc8a8_100%)]",
          animatorStateClasses[introAnimationState]
        )}
      />

      {/* Wrapper ที่จะ Fade in */}
      <div
        className={clsx(
          "relative z-10 w-full max-w-md",
          "transition-opacity duration-500 ease-out",
          introAnimationState === "finished"
            ? "opacity-100 delay-300"
            : "opacity-0"
        )}
      >
        {/* Flipper */}
        <div
          className="perspective-1000"
          onMouseEnter={() => setIsFlipped(true)}
          onMouseLeave={() => setIsFlipped(false)}
        >
          <div
            className={clsx(
              "relative w-[320px] h-[550px] md:w-[380px] md:h-[600px] transform-style-preserve-3d transition-transform duration-1000",
              isFlipped ? "rotate-y-180 card-flipped" : ""
            )}
          >
            {/* --- ด้านหน้า (โลโก้) --- */}
            <div
              className={clsx(
                "absolute inset-0 backface-hidden flex items-center justify-center p-6",
                "front-face"
              )}
              style={{
                background:
                  "linear-gradient(to bottom right, #E2B887 0%, #B5EAD7 100%)",
                borderRadius: "1.5rem",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              {/* Container สำหรับโลโก้ Pawsnap โดยเฉพาะ */}
              <div className="flex flex-col items-center justify-center text-center">
                {/* Update image container with fixed dimensions and proper image path */}
                <div className="w-[200px] h-[200px] flex items-center justify-center">
                  <img
                    src="Pawsnap.png"
                    alt="PawSnap Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* --- ด้านหลัง (ฟอร์ม) --- */}
            <div
              className={clsx("absolute inset-0 backface-hidden", "back-face")}
            >
              <AuthFormLayout
                isRegisterLayout={isRegisterForm}
                onSwitch={() => setIsRegisterForm(!isRegisterForm)}
              >
                {isRegisterForm ? (
                  <RegisterFormComponent
                    onSubmit={handleSubmit}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    petName={petName}
                    setPetName={setPetName}
                    error={error}
                    authLoading={authLoading}
                  />
                ) : (
                  <LoginFormComponent
                    onSubmit={handleSubmit}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    error={error}
                    authLoading={authLoading}
                  />
                )}
              </AuthFormLayout>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;

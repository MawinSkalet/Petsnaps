import React from "react";

//Login form
export function LoginFormComponent({
  onSubmit,
  email,
  setEmail,
  password,
  setPassword,
  error,
  authLoading,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          className="w-full px-4 py-3 border-2 border-orange-200 rounded-2xl focus:border-orange-400 focus:outline-none transition bg-white/80 backdrop-blur"
          placeholder="Email"
          required
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border-2 border-orange-200 rounded-2xl focus:border-orange-400 focus:outline-none transition bg-white/80 backdrop-blur"
          placeholder="Password"
          required
        />
      </div>
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm border border-red-200">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={authLoading}
        className="w-full bg-[linear-gradient(to_right,_#E2B887,_#B5EAD7)] text-gray-800 py-3 rounded-2xl font-semibold hover:brightness-95 transition disabled:opacity-50 shadow-lg transform hover:scale-105"
      >
        {authLoading ? "Loading..." : "🐾 Sign In"}
      </button>
    </form>
  );
}

//Register form
export function RegisterFormComponent({
  onSubmit,
  email,
  setEmail,
  password,
  setPassword,
  petName,
  setPetName,
  error,
  authLoading,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={petName}
          onChange={(e) => setPetName(e.target.value)}
          className="w-full px-4 py-3 border-2 border-orange-200 rounded-2xl focus:border-orange-400 focus:outline-none transition bg-white/80 backdrop-blur"
          placeholder="Nickname"
          required
        />
      </div>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border-2 border-orange-200 rounded-2xl focus:border-orange-400 focus:outline-none transition bg-white/80 backdrop-blur"
          placeholder="Email"
          required
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border-2 border-orange-200 rounded-2xl focus:border-orange-400 focus:outline-none transition bg-white/80 backdrop-blur"
          placeholder="Password"
          required
        />
      </div>
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm border border-red-200">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={authLoading}
        className="w-full bg-[linear-gradient(to_right,_#E2B887,_#B5EAD7)] text-gray-800 py-3 rounded-2xl font-semibold hover:brightness-95 transition disabled:opacity-50 shadow-lg transform hover:scale-105"
      >
        {authLoading ? "Loading..." : "🐾 Sign Up"}
      </button>
    </form>
  );
}

//Layout for Login/Register
export function AuthFormLayout({ children, isRegisterLayout, onSwitch }) {
  return (
    <div className="bg-[linear-gradient(to_bottom_right,_#E2B887_0%,_#B5EAD7_100%)] rounded-3xl shadow-2xl p-8 w-full h-full flex flex-col justify-center min-h-[550px] py-12">
      {/* Text Section - Centered */}
      <div className="text-center mb-8">
        {" "}
        {/* Kept text-center here for H1 and P */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          {isRegisterLayout ? "Sign Up" : "Sign In"}
        </h1>
        <p className="text-gray-700 font-medium">Welcome to PawSnap 🐾</p>
      </div>

      {/* แสดงฟอร์ม Login หรือ Register ที่ส่งเข้ามา */}
      {children}

      {/*Switch regis and login button*/}
      <div className="mt-6 text-center">
        <button
          type="button" // สำคัญ: ใส่ type="button" เพื่อไม่ให้ submit form หลัก
          onClick={onSwitch} // เรียกใช้ function ที่ส่งมาจาก AuthScreen
          className="text-[#A4805C] hover:text-[#836546] font-medium"
        >
          {isRegisterLayout
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}

const customStyles = `

  .front-face, .back-face {
    backface-visibility: hidden;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  /* when hidden, disable pointer events */
  .card-flipped .front-face {
    opacity: 0;
    pointer-events: none;  
  }

  .card-flipped .back-face {
    opacity: 1;
    pointer-events: auto;  
  }


  /*  3D Flip Utilities  */
    .perspective-1000 {
      perspective: 1000px;
    }
    .transform-style-preserve-3d {
      transform-style: preserve-3d;
      transform: translateZ(0);
    }
    .backface-hidden {
      backface-visibility: hidden;
    }
    .rotate-y-180 {
      transform: rotateY(180deg);
    }
    
    .front-face {
      transform: rotateY(0deg) translateZ(1px);
      opacity: 1;
      transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    .back-face {
      transform: rotateY(180deg) translateZ(1px);
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    .card-flipped .front-face {
      opacity: 0;
    }
    
    .card-flipped .back-face {
      opacity: 1;
    }
  `;


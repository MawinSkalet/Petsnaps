import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import Layout from "./components/Layout";
import AuthScreen from "./pages/AuthScreen";
import HomePage from "./pages/HomePage";
import MapView from "./pages/MapView";
import AddPostPage from "./pages/AddPostPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";

// 👇 *** อัปเดต customStyles ให้รองรับ 3D Transform และ Easing ***
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
    pointer-events: none;  /* 🧩 KEY FIX */
  }

  .card-flipped .back-face {
    opacity: 1;
    pointer-events: auto;  /* 🧩 KEY FIX */
  }


  /* --- 3D Flip Utilities --- */
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
// ✅ Inject custom 3D styles once into the document head
if (typeof document !== "undefined" && !document.getElementById("custom-3d-styles")) {
  const style = document.createElement("style");
  style.id = "custom-3d-styles";
  style.textContent = customStyles;
  document.head.appendChild(style);
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthScreen />} />
        <Route
          path="*"
          element={
            <DataProvider>
              <Layout>
                <Routes>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/map" element={<MapView />} />
                  <Route path="/add" element={<AddPostPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Layout>
            </DataProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

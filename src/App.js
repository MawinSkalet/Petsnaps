// src/App.js
import "./firebase";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import Layout from "./components/Layout";
import AuthScreen from "./pages/AuthScreen";
import HomePage from "./pages/HomePage";
import MapView from "./pages/MapView";
import AddPostPage from "./pages/AddPostPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import ReportPage from "./pages/ReportPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Login / Register */}
          <Route path="/" element={<AuthScreen />} />

          {/* Private routes */}
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
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/:uid" element={<ProfilePage />} />
                    <Route path="/report" element={<ReportPage />} />
                  </Routes>
                </Layout>
              </DataProvider>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
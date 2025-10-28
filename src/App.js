import "./firebase";
import React, { useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import AuthScreen from "./pages/AuthScreen";
import HomePage from "./pages/HomePage";
import AddPostPage from "./pages/AddPostPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

// NEW pages you added for social:
import SearchPage from "./pages/SearchPage";
import NotificationsPage from "./pages/NotificationsPage";
import UserProfilePage from "./pages/UserProfilePage";
import PostPage from "./pages/PostPage";

import HopeHubPage from "./pages/HopeHubPage";

function AppContent() {
  const homePageRef = useRef();

  const handleHomeClick = () => {
    if (homePageRef.current) {
      homePageRef.current.refresh();
    }
  };

  return (
    <Routes>
      {/* Public route (login/register) */}
      <Route path="/" element={<AuthScreen />} />

      {/* Private app */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <DataProvider>
              <Layout onHomeClick={handleHomeClick}>
                <Routes>
                  <Route
                    path="/home"
                    element={<HomePage ref={homePageRef} />}
                  />
                  <Route path="/add" element={<AddPostPage />} />
                  <Route path="/add-post" element={<AddPostPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/chat/:chatId" element={<ChatPage />} />
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* NEW */}
                  <Route path="/u/:uid" element={<UserProfilePage />} />
                  <Route path="/user/:uid" element={<UserProfilePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route
                    path="/notifications"
                    element={<NotificationsPage />}
                  />
                  <Route path="/post/:postId" element={<PostPage />} />

                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/hope" element={<HopeHubPage />} />
                </Routes>
              </Layout>
            </DataProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

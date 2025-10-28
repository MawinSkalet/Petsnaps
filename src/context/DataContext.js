import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getPosts,
  getAllUsers,
  listenForFriendRequests,
  getUserProfile,
  addPost,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  sendMessage,
  listenForMessages,
  uploadFile,
} from "../services/mockApi";
import { useAuth } from "./AuthContext";

const DataContext = createContext();

export const useData = () => {
  return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userProfiles, setUserProfiles] = useState({}); 
  const [friendRequests, setFriendRequests] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    setDataLoading(true);
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const loadAllUsers = useCallback(async () => {
    try {
      const fetchedUsers = await getAllUsers();
      setAllUsers(fetchedUsers);
      const profiles = {};
      fetchedUsers.forEach(u => (profiles[u.id] = u));
      setUserProfiles(prev => ({ ...prev, ...profiles }));
    } catch (error) {
      console.error("Error loading all users:", error);
    }
  }, []);

  const fetchUserProfile = useCallback(async (uid) => {
    if (userProfiles[uid]) {
      return userProfiles[uid];
    }
    try {
      const profile = await getUserProfile(uid);
      if (profile) {
        setUserProfiles(prev => ({ ...prev, [uid]: profile }));
      }
      return profile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }, [userProfiles]);

  useEffect(() => {
    if (user) {
      loadPosts();
      loadAllUsers();

      const unsubscribeFriendRequests = listenForFriendRequests(user.uid, (requests) => {
        setFriendRequests(requests);
      });

      return () => {
        unsubscribeFriendRequests();
      };
    }
  }, [user, loadPosts, loadAllUsers]);

  const value = {
    posts,
    allUsers,
    friendRequests,
    dataLoading,
    loadPosts,
    loadAllUsers,
    fetchUserProfile,
    addPost,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    sendMessage,
    listenForMessages,
    uploadFile,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  getPosts,
  getAllUsers,
  listenForFriendRequests,
} from "../firebase/api";

const DataContext = createContext();

export const useData = () => {
  return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const fetchedUsers = await getAllUsers();
      setAllUsers(fetchedUsers);
    } catch (error) {
      console.error("Error loading all users:", error);
    }
  };

  useEffect(() => {
    let unsubscribeRequests;
    const loadInitialData = async () => {
      setDataLoading(true);
      if (user) {
        await Promise.all([loadPosts(), loadAllUsers()]);
        unsubscribeRequests = listenForFriendRequests(user.uid, setFriendRequests);
      } else {
        setPosts([]);
        setAllUsers([]);
        setFriendRequests([]);
      }
      setDataLoading(false);
    };

    if (!authLoading) {
      loadInitialData();
    }

    return () => {
      if (unsubscribeRequests) unsubscribeRequests();
    };
  }, [user, authLoading]);

  const value = {
    posts,
    allUsers,
    friendRequests,
    dataLoading,
    loadPosts, // Function to refresh posts
    loadAllUsers, // Function to refresh all users
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

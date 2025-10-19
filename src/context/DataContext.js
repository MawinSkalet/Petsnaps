import React, { createContext, useContext, useState } from "react";

const DataContext = createContext();

export const useData = () => {
  return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
  // Since backend is removed, data will be empty or mocked
  const [posts, setPosts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [dataLoading, setDataLoading] = useState(false); // No loading as no backend calls

  const value = {
    posts,
    allUsers,
    friendRequests,
    dataLoading,
    // Mock functions or remove if not needed
    loadPosts: () => console.log("Posts loading disabled (no backend)"),
    loadAllUsers: () => console.log("Users loading disabled (no backend)"),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

let mockUser = null;

const mockUserProfileData = {
  mockUserId: {
    id: 'mockUserId',
    petName: 'Mocky',
    email: 'test@example.com',
    photoURL: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Mocky',
    friends: ['mockFriend1'],
    createdAt: new Date(Date.now() - 86400000),
  },
  mockFriend1: {
    id: 'mockFriend1',
    petName: 'Buddy',
    email: 'buddy@example.com',
    photoURL: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Buddy',
    friends: ['mockUserId'],
    createdAt: new Date(Date.now() - 172800000),
  },
   mockFriend2: {
    id: 'mockFriend2',
    petName: 'Lucy',
    email: 'lucy@example.com',
    photoURL: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Lucy',
    friends: [],
    createdAt: new Date(Date.now() - 259200000),
  }
};

let mockPostsData = [
  { id: 'post1', userId: 'mockUserId', petName: 'Mocky', userPhoto: mockUserProfileData.mockUserId.photoURL, imageUrl: 'https://place-puppy.com/400x400', caption: 'My first mock post! 🐾', likes: 10, likedBy: ['mockFriend1'], createdAt: new Date(Date.now() - 3600000) },
  { id: 'post2', userId: 'mockFriend1', petName: 'Buddy', userPhoto: mockUserProfileData.mockFriend1.photoURL, imageUrl: 'https://place-puppy.com/401x401', caption: 'Having fun outside!', likes: 5, likedBy: ['mockUserId'], createdAt: new Date(Date.now() - 7200000) },
  { id: 'post3', userId: 'mockFriend2', petName: 'Lucy', userPhoto: mockUserProfileData.mockFriend2.photoURL, imageUrl: 'https://place-puppy.com/402x402', caption: 'Sleepy time 😴', likes: 2, likedBy: [], createdAt: new Date(Date.now() - 10800000) },
];

let mockFriendRequestsData = [

];

let mockMessagesData = {};


export const signUp = async (email, password, petName) => {
  console.log('Mock API: signUp called with', email, petName);
  const newUserId = `mockUser${Date.now()}`;
  const defaultPhotoURL = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${petName || newUserId}`;
  mockUserProfileData[newUserId] = {
    id: newUserId,
    petName: petName || "New Pet",
    email: email,
    photoURL: defaultPhotoURL,
    friends: [],
    createdAt: new Date(),
  };
  mockUser = { uid: newUserId, email: email };
  console.log('Mock API: User signed up and logged in:', mockUser);
  return Promise.resolve(mockUser);
};

export const signIn = async (email, password) => {
  console.log('Mock API: signIn called with', email);
  if (email === 'test@example.com' && password === 'password') {
    mockUser = { uid: 'mockUserId', email: 'test@example.com' };
    console.log('Mock API: User signed in:', mockUser);
    return Promise.resolve(mockUser);
  }
  console.error('Mock Auth: Invalid credentials');
  throw new Error('Mock Auth: Invalid credentials');
};

export const logout = async () => {
  console.log('Mock API: logout called');
  mockUser = null;
  return Promise.resolve();
};


let authStateListeners = []; // Change to an array to support multiple listeners

export const onAuthStateChanged = (callback) => {
  console.log('Mock API: Attaching auth state listener');
  authStateListeners.push(callback); // Add callback to the array

  // Immediately call the callback with the current user state
  callback(mockUser ? { uid: mockUser.uid, email: mockUser.email } : null);

  return () => {
    console.log('Mock API: Detaching auth state listener');
    authStateListeners = authStateListeners.filter(listener => listener !== callback); // Remove listener
  };
};

const triggerAuthStateChange = () => {
  console.log('Mock API: Triggering auth state change with user:', mockUser);
  authStateListeners.forEach(callback => {
    callback(mockUser ? { uid: mockUser.uid, email: mockUser.email } : null);
  });
};

export const mockSignIn = async (email, password) => {
  await signIn(email, password);
  triggerAuthStateChange();
};
export const mockLogout = async () => {
  await logout();
  triggerAuthStateChange();
};
export const mockSignUp = async (email, password, petName) => {
    await signUp(email, password, petName);
    triggerAuthStateChange();
    return mockUser;
};


export const uploadFile = async (file, path) => {
  console.log('Mock API: uploadFile called for path', path);

  await new Promise(resolve => setTimeout(resolve, 500));
  if (file && file.type.startsWith('image/')) {
    return Promise.resolve(URL.createObjectURL(file));
  }
  return Promise.resolve(`https://mockstorage.com/${path}`);
};


export const getUserProfile = async (uid) => {
  console.log('Mock API: getUserProfile called for', uid);
  await new Promise(resolve => setTimeout(resolve, 100));
  return Promise.resolve(mockUserProfileData[uid] ? { ...mockUserProfileData[uid] } : null);
};

export const getAllUsers = async () => {
  console.log('Mock API: getAllUsers called');
   await new Promise(resolve => setTimeout(resolve, 200));
  return Promise.resolve(Object.values(mockUserProfileData).map(u => ({ ...u })));
};

export const updateUserProfile = async (uid, data) => {
  console.log('Mock API: updateUserProfile called for', uid, 'with data', data);
   await new Promise(resolve => setTimeout(resolve, 300));
  if (mockUserProfileData[uid]) {
    mockUserProfileData[uid] = { ...mockUserProfileData[uid], ...data };

    if (mockUser && mockUser.uid === uid) {
       console.log('Mock API: Updating current user profile cache');
    }
    return Promise.resolve();
  }
  return Promise.reject(new Error("User not found"));
};


export const getPosts = async () => {
  console.log('Mock API: getPosts called');
   await new Promise(resolve => setTimeout(resolve, 500));

  return Promise.resolve([...mockPostsData].sort((a, b) => b.createdAt - a.createdAt));
};

export const addPost = async (postData) => {
  console.log('Mock API: addPost called with', postData);
   await new Promise(resolve => setTimeout(resolve, 400));
   const currentUserProfile = mockUserProfileData[postData.userId];
  const newPost = {
    id: `mockPost${Date.now()}`,
    ...postData,
    petName: currentUserProfile?.petName || 'Unknown Pet',
    userPhoto: currentUserProfile?.photoURL || '',
    likes: 0,
    likedBy: [],
    createdAt: new Date(),
  };
  mockPostsData.unshift(newPost);
  return Promise.resolve();
};

export const deletePost = async (postId) => {
  console.log('Mock API: deletePost called for', postId);
   await new Promise(resolve => setTimeout(resolve, 200));
  mockPostsData = mockPostsData.filter(p => p.id !== postId);
  return Promise.resolve();
};

export const updatePostLikes = async (postId, userId, liked) => {
  console.log('Mock API: updatePostLikes called for', postId, userId, liked);
  await new Promise(resolve => setTimeout(resolve, 50));
  const postIndex = mockPostsData.findIndex(p => p.id === postId);
  if (postIndex > -1) {
    const post = mockPostsData[postIndex];
    const currentLikedBy = post.likedBy || [];
    if (liked) {
      post.likes = Math.max(0, (post.likes || 0) - 1);
      post.likedBy = currentLikedBy.filter(id => id !== userId);
    } else {
      post.likes = (post.likes || 0) + 1;
      post.likedBy = [...currentLikedBy, userId];
    }
    console.log('Mock API: Updated likes for post', postId, ':', post.likes, 'likedBy:', post.likedBy);
    return Promise.resolve();
  }
  return Promise.reject(new Error("Post not found"));
};


let friendRequestListeners = [];
const notifyFriendRequestListeners = (userId) => {
    const requestsForUser = mockFriendRequestsData.filter(req => req.receiverId === userId);
    const requestsWithSender = requestsForUser.map(req => ({
        ...req,
        senderName: mockUserProfileData[req.senderId]?.petName || "Unknown Pet",
        senderPhoto: mockUserProfileData[req.senderId]?.photoURL || "",
    }));
    friendRequestListeners.forEach(listener => {
        if (listener.userId === userId) {
            listener.callback(requestsWithSender);
        }
    });
};


export const sendFriendRequest = async (senderId, receiverId) => {
  console.log('Mock API: sendFriendRequest', senderId, '->', receiverId);
  await new Promise(resolve => setTimeout(resolve, 150));

  if (senderId === receiverId || mockUserProfileData[senderId]?.friends?.includes(receiverId)) {
      console.log('Mock API: Request blocked (self or already friends)');
      return Promise.resolve();
  }

  const existingRequest = mockFriendRequestsData.find(req =>
      (req.senderId === senderId && req.receiverId === receiverId) ||
      (req.senderId === receiverId && req.receiverId === senderId)
  );
  if (existingRequest) {
      console.log('Mock API: Request blocked (already exists)');
       return Promise.resolve();
  }

  const newRequest = {
    id: `req${Date.now()}`,
    senderId,
    receiverId,
    createdAt: new Date(),
  };
  mockFriendRequestsData.push(newRequest);
  notifyFriendRequestListeners(receiverId);
  return Promise.resolve();
};

export const acceptFriendRequest = async (requestId, senderId, receiverId) => {
  console.log('Mock API: acceptFriendRequest', requestId);
   await new Promise(resolve => setTimeout(resolve, 250));
  const requestIndex = mockFriendRequestsData.findIndex(req => req.id === requestId);
  if (requestIndex > -1) {
    mockFriendRequestsData.splice(requestIndex, 1);


    if (mockUserProfileData[senderId]) {
      mockUserProfileData[senderId].friends = [...(mockUserProfileData[senderId].friends || []), receiverId];
    }
    if (mockUserProfileData[receiverId]) {
      mockUserProfileData[receiverId].friends = [...(mockUserProfileData[receiverId].friends || []), senderId];
    }

    notifyFriendRequestListeners(receiverId);
    console.log('Mock API: Friend added:', senderId, '<->', receiverId);
    return Promise.resolve();
  }
   return Promise.reject(new Error("Request not found"));
};

export const rejectFriendRequest = async (requestId) => {
  console.log('Mock API: rejectFriendRequest', requestId);
   await new Promise(resolve => setTimeout(resolve, 100));
   const requestIndex = mockFriendRequestsData.findIndex(req => req.id === requestId);
   if (requestIndex > -1) {
       const receiverId = mockFriendRequestsData[requestIndex].receiverId;
       mockFriendRequestsData.splice(requestIndex, 1);
       notifyFriendRequestListeners(receiverId);
       return Promise.resolve();
   }
   return Promise.reject(new Error("Request not found"));
};

export const listenForFriendRequests = (currentUserId, callback) => {
  console.log('Mock API: Attaching friend request listener for', currentUserId);
  const listener = { userId: currentUserId, callback };
  friendRequestListeners.push(listener);


  const initialRequests = mockFriendRequestsData.filter(req => req.receiverId === currentUserId);
   const initialRequestsWithSender = initialRequests.map(req => ({
        ...req,
        senderName: mockUserProfileData[req.senderId]?.petName || "Unknown Pet",
        senderPhoto: mockUserProfileData[req.senderId]?.photoURL || "",
    }));
  callback(initialRequestsWithSender);


  return () => {
    console.log('Mock API: Detaching friend request listener for', currentUserId);
    friendRequestListeners = friendRequestListeners.filter(l => l !== listener);
  };
};


export const getChatId = (uid1, uid2) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

let messageListeners = {};

const notifyMessageListeners = (chatId) => {
    if (messageListeners[chatId]) {
        const messages = mockMessagesData[chatId] || [];
        messageListeners[chatId].forEach(callback => callback(messages));
    }
};

export const sendMessage = async (senderId, receiverId, text) => {
  console.log('Mock API: sendMessage', senderId, '->', receiverId, ':', text);
   await new Promise(resolve => setTimeout(resolve, 80));
  const chatId = getChatId(senderId, receiverId);
  if (!mockMessagesData[chatId]) {
    mockMessagesData[chatId] = [];
  }
  const newMessage = {
    id: `msg${Date.now()}`,
    text,
    senderId,
    receiverId,
    createdAt: new Date(),
  };
  mockMessagesData[chatId].push(newMessage);
  notifyMessageListeners(chatId);
  return Promise.resolve();
};

export const listenForMessages = (uid1, uid2, callback) => {
  const chatId = getChatId(uid1, uid2);
  console.log('Mock API: Attaching message listener for chat', chatId);
  if (!messageListeners[chatId]) {
    messageListeners[chatId] = [];
  }
  messageListeners[chatId].push(callback);


  const initialMessages = mockMessagesData[chatId] || [];
  callback(initialMessages);


  return () => {
    console.log('Mock API: Detaching message listener for chat', chatId);
    messageListeners[chatId] = messageListeners[chatId].filter(cb => cb !== callback);
    if (messageListeners[chatId].length === 0) {
      delete messageListeners[chatId];
    }
  };
};


let mockCommentsData = {
  post1: [
    { id: "c1", userId: "mockFriend1", text: "So cute!", createdAt: new Date() },
    { id: "c2", userId: "mockUserId", text: "Thanks!", createdAt: new Date() },
  ],
  post2: [],
};

export const getComments = async (postId) => {
  await new Promise((res) => setTimeout(res, 100));
  return Promise.resolve(mockCommentsData[postId] || []);
};

export const addComment = async (postId, userId, text) => {
  const newComment = {
    id: `c${Date.now()}`,
    userId,
    text,
    createdAt: new Date(),
  };
  if (!mockCommentsData[postId]) mockCommentsData[postId] = [];
  mockCommentsData[postId].push(newComment);
  return Promise.resolve(newComment);
};

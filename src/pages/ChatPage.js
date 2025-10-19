import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { getChatId } from "../services/mockApi";

function ChatPage() {
  const { user } = useAuth();
  const { allUsers, fetchUserProfile, sendMessage, listenForMessages, sendFriendRequest } = useData();
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatUsers, setChatUsers] = useState([]); // Users the current user has chatted with
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user && allUsers.length > 0) {
      // For mock API, let's just show all users as potential chat partners
      // In a real app, you'd filter to friends or recent chats
      setChatUsers(allUsers.filter(u => u.id !== user.uid));
    }
  }, [user, allUsers]);

  useEffect(() => {
    let unsubscribe;
    if (user && selectedChatUser) {
      const chatId = getChatId(user.uid, selectedChatUser.id);
      unsubscribe = listenForMessages(user.uid, selectedChatUser.id, (fetchedMessages) => {
        setMessages(fetchedMessages);
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, selectedChatUser, listenForMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && user && selectedChatUser) {
      try {
        await sendMessage(user.uid, selectedChatUser.id, newMessage.trim());
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleAddFriend = async (receiverId) => {
    if (user && receiverId) {
      try {
        await sendFriendRequest(user.uid, receiverId);
        alert("Friend request sent!");
      } catch (error) {
        console.error("Error sending friend request:", error);
        alert("Failed to send friend request.");
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Left Pane: User List */}
      <div className="w-1/3 border-r border-[#E2B887]/30 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#8B6F47] mb-6">Chats</h2>
        {chatUsers.length === 0 ? (
          <p className="text-[#8B6F47]/60">No users to chat with.</p>
        ) : (
          <div className="space-y-3">
            {chatUsers.map((chatUser) => (
              <div
                key={chatUser.id}
                className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  selectedChatUser?.id === chatUser.id
                    ? "bg-[#E2B887] text-white"
                    : "hover:bg-[#F5F5F5] text-[#8B6F47]"
                }`}
                onClick={() => setSelectedChatUser(chatUser)}
              >
                <img
                  src={chatUser.photoURL}
                  alt={chatUser.petName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <p className="font-semibold">{chatUser.petName}</p>
                {/* Optionally add a button to send friend request if not already friends */}
                {!user?.friends?.includes(chatUser.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddFriend(chatUser.id);
                    }}
                    className="ml-auto p-1 rounded-full hover:bg-white hover:text-[#E2B887] text-white"
                    title="Send Friend Request"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Pane: Chat Window */}
      <div className="w-2/3 flex flex-col">
        {selectedChatUser ? (
          <>
            <div className="bg-[#F5F5F5] p-4 border-b border-[#E2B887]/30 flex items-center space-x-3">
              <img
                src={selectedChatUser.photoURL}
                alt={selectedChatUser.petName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <h3 className="text-xl font-bold text-[#8B6F47]">
                {selectedChatUser.petName}
              </h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-[#8B6F47]/60">
                  Start a conversation!
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === user.uid ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-xl ${
                        msg.senderId === user.uid
                          ? "bg-[#E2B887] text-white"
                          : "bg-[#F5F5F5] text-[#8B6F47]"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#E2B887]/30 flex items-center space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-3 border border-[#E2B887]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2B887] text-[#8B6F47] placeholder-[#8B6F47]/50"
              />
              <button
                type="submit"
                className="bg-[#E2B887] text-white p-3 rounded-full hover:bg-[#D4A77C] transition-colors"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-[#8B6F47]/60">
            <p className="text-xl">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;

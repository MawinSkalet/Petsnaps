import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { sendMessage, listenForMessages } from "../firebase/api";

function ChatPage() {
  const { user, userProfile } = useAuth();
  const { allUsers } = useData();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);
  const friendsList = userProfile?.friends || [];

  useEffect(() => {
    if (selectedUser) {
      const unsubscribe = listenForMessages(
        user.uid,
        selectedUser.id,
        setMessages
      );
      return () => unsubscribe();
    }
  }, [selectedUser, user.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await sendMessage(user.uid, selectedUser.id, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex h-[600px] bg-white rounded-3xl shadow-lg overflow-hidden">
      <div className="w-1/3 border-r border-[#E2B887]/30 overflow-y-auto">
        <div className="p-4 border-b border-[#E2B887]/30 bg-gradient-to-r from-[#E2B887] to-[#B5EAD7]">
          <h3 className="text-lg font-bold text-white">chat</h3>
        </div>
        <div className="divide-y divide-[#E2B887]/30">
          {allUsers
            .filter((u) => friendsList.includes(u.id))
            .map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-[#FFE7CC]/30 transition ${
                  selectedUser?.id === u.id ? "bg-[#FFE7CC]/50" : ""
                }`}
              >
                <img
                  src={u.photoURL}
                  alt={u.petName}
                  className="w-10 h-10 rounded-full border-2 border-[#E2B887] object-cover"
                />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[#8B6F47]">{u.petName}</p>
                </div>
              </button>
            ))}
        </div>
        {allUsers.filter((u) => friendsList.includes(u.id)).length === 0 && (
          <div className="p-8 text-center text-[#8B6F47]/60">
            No friends yet. Add some friends to start chatting!
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-[#E2B887]/30 bg-gradient-to-r from-[#E2B887] to-[#B5EAD7] flex items-center space-x-3">
              <img
                src={selectedUser.photoURL}
                alt={selectedUser.petName}
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
              <p className="font-bold text-white">{selectedUser.petName}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFE7CC]/20">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === user.uid
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                      message.senderId === user.uid
                        ? "bg-gradient-to-r from-[#E2B887] to-[#B5EAD7] text-white"
                        : "bg-white text-[#8B6F47] shadow"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === user.uid
                          ? "text-white/70"
                          : "text-[#8B6F47]/60"
                      }`}
                    >
                      {message.createdAt?.toDate
                        ? new Date(
                            message.createdAt.toDate()
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Sending..."}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-[#E2B887]/50 mx-auto mb-4" />
                  <p className="text-[#8B6F47]/60">
                    Start chatting with {selectedUser.petName}!
                  </p>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-[#E2B887]/30 bg-white"
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border-2 border-[#E2B887]/30 rounded-xl focus:border-[#E2B887] focus:outline-none transition"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#E2B887] to-[#B5EAD7] text-white rounded-xl font-semibold hover:opacity-90 transition flex items-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#FFE7CC]/20">
            <div className="text-center">
              <MessageCircle className="w-20 h-20 text-[#E2B887]/50 mx-auto mb-4" />
              <p className="text-xl text-[#8B6F47]/60">
                Select a friend to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;

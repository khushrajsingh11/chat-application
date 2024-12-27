import React, { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { usechatStore } from "../../../lib/chatStore";

function ChatList() {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { changeChat } = usechatStore();

  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    // Real-time listener for the current user's chats
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (snapshot) => {
        if (snapshot.exists()) {
          const items = snapshot.data().chats || [];

          // Fetch additional user details for each chat
          const promises = items.map(async (item) => {
            const userDocRef = doc(db, "users", item.receiverId);
            const userDocSnap = await getDoc(userDocRef);
            const user = userDocSnap.exists() ? userDocSnap.data() : null;
            return { ...item, user };
          });

          const chatData = await Promise.all(promises);
          setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        }
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    try {
      // Mark the selected chat as seen locally
      const updatedChats = chats.map((item) => {
        if (item.chatId === chat.chatId) {
          return { ...item, isSeen: true };
        }
        return item;
      });

      setChats(updatedChats);

      // Update the `isSeen` status in Firestore
      const userChatsRef = doc(db, "userchats", currentUser.id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const userChatsData = userChatsSnapshot.data();
        const chatIndex = userChatsData.chats.findIndex(
          (c) => c.chatId === chat.chatId
        );

        if (chatIndex > -1) {
          userChatsData.chats[chatIndex].isSeen = true;
          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      }

      // Update the selected chat in the chat store
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.error("Error updating isSeen:", error);
    }
  };

  const handleAddUser = async (newUser) => {
    try {
      const userChatsRef = doc(db, "userchats", currentUser.id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const userChatsData = userChatsSnapshot.data();
        const newChat = {
          receiverId: newUser.id,
          chatId: `${currentUser.id}_${newUser.id}`, // Unique chat ID
          isSeen: false,
          lastMessage: "",
          updatedAt: Date.now(),
        };

        await updateDoc(userChatsRef, {
          chats: [...(userChatsData.chats || []), newChat],
        });

        setAddMode(false); // Exit add mode after successful addition
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.user?.username?.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="Search" />
          <input
            type="text"
            placeholder="Search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt="Add Chat"
          onClick={() => setAddMode((prev) => !prev)}
          className="add"
        />
      </div>

      {filteredChats.length > 0 ? (
        filteredChats.map((chat, index) => (
          <div
            className="item"
            key={chat.chatId || `chat-${index}`}
            onClick={() => handleSelect(chat)}
            style={{
              backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
            }}
          >
            <img
              src={
                chat.user?.blocked?.includes(currentUser.id)
                  ? "./avatar.png"
                  : chat.user?.avatar || "./avatar.png"
              }
              alt="User Avatar"
            />
            <div className="texts">
              <span>
                {chat.user?.blocked?.includes(currentUser.id)
                  ? "User"
                  : chat.user?.username || "Unknown User"}
              </span>
              <p>{chat.lastMessage || ""}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No chats available</p>
      )}

      {addMode && <AddUser onAddUser={handleAddUser} />}
    </div>
  );
}

export default ChatList;

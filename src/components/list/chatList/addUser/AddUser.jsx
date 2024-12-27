import React, { useState } from "react";
import "./addUser.css";
import { db } from "../../../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useUserStore } from "../../../../lib/userStore";

function AddUser() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("Please enter a username.");
      setLoading(false);
      return;
    }

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        const userId = querySnapshot.docs[0].id;
        setUser({ ...userData, id: userId });
      } else {
        setError("No user found with that username.");
        setUser(null);
      }
    } catch (err) {
      console.error("Error searching for user:", err);
      setError("An error occurred while searching for the user.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);

      // Create a new chat document
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Ensure userChats documents exist
      await setDoc(doc(userChatsRef, user.id), { chats: [] }, { merge: true });
      await setDoc(doc(userChatsRef, currentUser.id), { chats: [] }, { merge: true });

      // Update chat references for both users
      const newChatData = {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: currentUser.id,
      };

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion(newChatData),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          ...newChatData,
          receiverId: user.id,
        }),
      });

      setSuccess("User added to chat successfully!");
      setUser(null);
      setUsername("");
    } catch (err) {
      console.error("Error adding user to chat:", err);
      setError("An error occurred while adding the user to the chat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="User Avatar" />
            <span>{user.username || "Unknown User"}</span>
          </div>
          <button onClick={handleAdd} disabled={loading}>
            {loading ? "Adding..." : "Add User"}
          </button>
        </div>
      )}
    </div>
  );
}

export default AddUser;

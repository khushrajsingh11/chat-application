import React from 'react'
import "./detail.css"
import { auth ,db} from '../../lib/firebase'
import { useUserStore } from '../../lib/userStore';
import { usechatStore } from '../../lib/chatStore';
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"; 

function Detail() {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, resetChat } =
    usechatStore();
    const { currentUser } = useUserStore();
    const handleBlock = async () => {
      if (!user) return;
  
      const userDocRef = doc(db, "users", currentUser.id);
  
      try {
        await updateDoc(userDocRef, {
          blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
        });
        console.log("user lboxcked")
        changeBlock();
      } catch (err) {
        console.log(err);
      }
    };

  return (
    <div className='detail'>
      <div className="user">
        <img src="./avatar.png" alt="" />
        <h2>{user?.username}</h2>

      </div>
      <div className='info'>

        
      
      <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "User blocked"
            : "Block User"}
        </button>
        <p>{isCurrentUserBlocked}</p>
      <button className='logout' onClick={()=>auth.signOut()}>logout</button>
      </div>
      
    </div>
  )
}

export default Detail
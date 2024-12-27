import { useEffect, useState } from 'react'
import './index.css'
import List from './components/list/List'
import Detail from './components/details/Detail'
import Chat from './components/chat/Chat'
import Login from './components/login/Login'
import Notification from './components/notification/Notification'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'
import { useUserStore } from './lib/userStore'
import { usechatStore } from './lib/chatStore'



function App() {
 
  const {currentUser,isLoading,fetchUserInfo} = useUserStore();

  const {chatId} = usechatStore();
 
 useEffect(()=>{
  const unSub = onAuthStateChanged(auth,(user) =>{
   fetchUserInfo(user?.uid);
  });
  return () =>{
    unSub();
  };
 },[fetchUserInfo]);

 console.log(currentUser)

 if(isLoading) return <div className='Loading' >Loading...</div>


  return (
    <>
      <div className='container'>
        { currentUser ? (
          <>
           <List/>
        {chatId && <Chat/>}
        {chatId && <Detail/>}
        
          </>
        ):(
          <Login/>
        )}
        <Notification/>
       
      </div>
    </>
  )
}

export default App

import React, { useState } from 'react';
import "./login.css";
import { toast } from 'react-toastify';
import { auth } from '../../lib/firebase';
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore"; 
import { db } from '../../lib/firebase';

function Login() {
  const [avatar, setAvatar] = useState({
    file: null,
    url: ""
  });

  const [loading,setLoading] = useState(false)

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };



  const handleLogin = async(e) =>{
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const {email ,password} = Object.fromEntries(formData);

    try{

      await signInWithEmailAndPassword(auth,email,password);

    } catch(err){
      console.log(err);
      toast.error(err.massage);
    }finally{
      setLoading(false);
    }
   
  };



  const handleRegister = async (e) =>{
    e.preventDefault();
    setLoading(true)
    const form = e.target;
    const formData = new FormData(form);
    const {username,email,password} = Object.fromEntries(formData);
    try{
      const res = await createUserWithEmailAndPassword(auth,email,password)
      


await setDoc(doc(db, "users", res.user.uid), {
  username,
  email,
  id:res.user.uid,
  blocked:[],
});
await setDoc(doc(db, "userchats", res.user.uid), {
  chats:[],
});

toast.success("Account created ! you can login now !")
    }catch(err){
      console.log(err)
      toast.error(err.massage)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back,</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" />
          <input type="text" placeholder="Password" name="password" />
          <button disabled ={loading}>{loading ? "Loading" : "Sign In"}</button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "avatar.png"} alt="Avatar" />
            Upload an image
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input type="text" placeholder="Username" name="username" />
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled = {loading} >{loading ? "loading" : "Sign Up"}</button>
        </form>
      </div>
    </div>
  );
}

export default Login;

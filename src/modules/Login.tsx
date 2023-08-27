import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { auth } from '../config/firebase'
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth'

const Login = () => {
  const { userData, login, logout } = useAuth();

  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((data) => {
        login(data.user);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  return (
    <div>
      {
        userData 
          ? <img src={userData.photoURL ?? ''} alt='' className='LoginImg'/>
          : <button className='MenuButton' onClick={googleLogin}>Login</button>
      }      
    </div>
  )
}

export default Login;
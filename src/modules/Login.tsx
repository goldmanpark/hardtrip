import React, { useState } from 'react';
import { auth } from '../config/firebase'
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth'

const Login = () => {
  const [userData, setUserData] = useState<User | null>(null);

  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((data) => {
        setUserData(data.user);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div>
      {
        userData 
          ? <span>USER:{userData.displayName}</span>
          : <button onClick={googleLogin}>Login</button>
      }      
    </div>
  )
}

export default Login;
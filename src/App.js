import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';


firebase.initializeApp(firebaseConfig);


function App() {
  const [newUser,setNewUser] = useState(false);
  const [user,setUser] = useState({
    // before sing in user value
    isSignedIn : false,
    name:'',
    email:'',
    password:'',
    photo:''
  })

  const provider = new firebase.auth.GoogleAuthProvider();
// sign in button handling
  const handleSignIn = () =>{
    firebase.auth().signInWithPopup(provider)
    .then( res => {
      const {displayName, photoURL, email} = res.user;
      // after sign in user value
      const signedInUser={
        isSignedIn:true,
        name:displayName,
        email:email,
        photo:photoURL
      }
      // calling the use state function after sign in
      setUser(signedInUser);
    })
    // error handling
    .catch(err=>{
      console.log(err);
      console.log(err.message);
    })
  }

// sign out button handling

const handleSignOut = () => {
firebase.auth().signOut()
.then(res => {
const signedOutUser ={
    isSignedIn:false,
    name:'',
    email:'',
    password:'',
    error:'',
    success:false,
    photo:''
}
setUser(signedOutUser);
})
.catch(err=>{
  console.log(err)
})
}

// event handler target value and name capture
const handleBlur = (e) =>{
  let isFieldValid = true;
  // email validation
  if (e.target.name === 'email') {
    isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
  }
  // pass validation
  if (e.target.name === 'password') {
    const isPassValid = e.target.value.length > 6
    const passHasNumber = /\d{1}/.test(e.target.value);
    isFieldValid = isPassValid && passHasNumber;
  }
  // form validation if email and pass is valid
  if (isFieldValid) {
    const newUserInfo = {...user}
    newUserInfo[e.target.name] = e.target.value;
    setUser(newUserInfo);
  }
}

const handleSubmit = (e) => {
  // console.log(user.email,user.password)
  if (newUser && user.email && user.password) {
    firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
    .then(res =>{
      const newUserInfo={...user};
      newUserInfo.error='';
      newUserInfo.success = true;
      setUser(newUserInfo);
      updateUserName(user.name);
    })
    .catch(error=> {
      const newUserInfo={...user}
      newUserInfo.error = error.message;
      newUserInfo.success = false;
      setUser(newUserInfo);
    });
  }
  if (!newUser && user.email && user.password) {
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(res=>{
      const newUserInfo={...user};
      newUserInfo.error='';
      newUserInfo.success = true;
      setUser(newUserInfo);
      console.log('sign in user info' , res.user)
    })
    .catch(error => {
      const newUserInfo={...user}
      newUserInfo.error = error.message;
      newUserInfo.success = false;
      setUser(newUserInfo);
    });
  }
  e.preventDefault();
}

const updateUserName = (name) => {
  const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    })
    .then(function() {
      console.log('User name updated successfully')
    }).catch(function(error) {
      console.log(error)
    });
}

  return (
    <div className="App">
      <header className="App-header">
        <br/>
      {
        user.isSignedIn ?<button onClick={handleSignOut}>Sign out</button> :
        <button onClick={handleSignIn}>Sign in with Google</button>
      }
        {
          user.isSignedIn && 
          <div>
            <p>Welcome, {user.name} ! </p>
            <p>Your email address is : {user.email} </p>
            <img src={user.photo} alt=""/>
          </div>
        }
        <h1>Our own authentication system</h1>
        <p>
        <input type="checkbox" onChange={() => setNewUser(!newUser)} name="new-user" id=""/> 
        <label htmlFor="new-user">New user Sign up</label>
        </p>
        <form onSubmit={handleSubmit}>
          { newUser &&
            <p>User Name : <input name="name" onBlur={handleBlur} type="text" placeholder="Your Name" /></p>
            }
          <p>Your email : <input type="text" onBlur={handleBlur} name="email" placeholder="Your email address" required/> </p>
          <p>Password : <input type="password" onBlur={handleBlur} name="password" placeholder="Your Password" required /> </p>
          <input type="submit" value={newUser ? 'Sign Up' : 'Sign In' } />
        </form>
        <p style={{color:'red'}}>{user.error} </p>
        {
          user.success && <p style={{color:'green'}}>Congratulation! Account {newUser ? 'created' : 'logged in'} successfully... </p>
        }
        <img src={logo} className="App-logo" alt="logo" />
      </header>
    </div>
  );
}

export default App;

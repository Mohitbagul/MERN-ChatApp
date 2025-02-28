import React from 'react'
import logo from '../Images/live-chat.png'
import { Button, TextField } from '@mui/material'
import { useNavigate } from 'react-router-dom';

const SignUp = () => {

    const navigate =  useNavigate();

  return (
    <div className='login-container'>
    <div className='image-container'>
    <img src={logo} alt="Logo" className='welcome-logo'/>
    </div>
    <div className='login-box'>
    <p className='login-text'>Create a new Account</p>
    <TextField id="outlined-basic" label="User Name" variant="outlined" />
    <TextField id="outlined-basic" label="E-mail" variant="outlined" />
    <TextField
          id="outlined-password-input"
          label="Password"
          type="password"
          autoComplete="current-password"
        />
        <Button variant="outlined">Sign Up</Button>
        <div style={{display:"flex",flexDirection:"row",gap:"3px"}}>Already registered? <a onClick={()=>{navigate("/")}} style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}>Login</a></div>
    </div>
    </div>
  )
}

export default SignUp
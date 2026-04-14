import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const LoginPopup = ({setShowLogin}) => {
    const { url, setToken, setRole } = useContext(StoreContext);
    const [currState , setCurrState] = useState("Login")
    const [data, setData] = useState({ name: "", email: "", password: "", role: "customer" })

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (event) => {
        event.preventDefault();
        let newUrl = url;
        if (currState === "Login") {
            newUrl += "/api/user/login"
        } else {
            newUrl += "/api/user/register"
        }

        try {
            const response = await axios.post(newUrl, data);
            if (response.data.success) {
                setToken(response.data.token);
                setRole(response.data.role);
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("role", response.data.role);
                setShowLogin(false);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error("An error occurred. Please try again.");
        }
    }

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
            <h2>{currState}</h2>
            <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
        </div>
        <div className='login-pop-up-input'>
            {currState === "Login" ? <></> : <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required/>}
            <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required/>
            <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required/>
            {currState === "Sign Up" && (
                <select name="role" onChange={onChangeHandler} value={data.role} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #c9c9c9' }}>
                    <option value="customer">Customer</option>
                    <option value="shop_owner">Shop Owner</option>
                </select>
            )}
        </div>
        <button type="submit">{currState==="Sign Up"?"Create Account":"Login"}</button>
        <div className='login-popup-condition'>
            <input type="checkbox" required/>
            <p>By continuing, i agree to the terms of use & privacy policy.</p>
        </div>
        {currState==="Login"? 
        <p>Create a new account? <span onClick={()=> setCurrState("Sign Up")}>Click Here</span></p>:
        <p>Already have an account? <span onClick={()=> setCurrState("Login")}>Login Here</span></p>
        }
      </form>
    </div>
  )
}

export default LoginPopup

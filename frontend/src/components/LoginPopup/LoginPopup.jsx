import React, { useContext, useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { StockContext } from '../../Context/StockContext';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const LoginPopup = ({ setShowlogin }) => {
  const { url, setToken } = useContext(StockContext);
  const { enqueueSnackbar } = useSnackbar();

  const [currState, setCurrState] = useState('Login');
  const [data, setData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [userName, setUserName] = useState(''); // State to store username

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    let newUrl = `${url}/api/user/login`;  // Default to Login endpoint
    if (currState === 'Sign Up') {
      newUrl = `${url}/api/user/register`;  // Switch to Register endpoint
    }
  
    try {
      const response = await axios.post(newUrl, data);
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userName', data.name || 'User');
        localStorage.setItem('userEmail', data.email);
  
        // Remove 'showLoginPopup' from localStorage on successful login
        localStorage.removeItem('showLoginPopup');
  
        setShowlogin(false);
        enqueueSnackbar(`${currState} successful!`, { variant: 'success' });
      } else {
        enqueueSnackbar(response.data.message, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error during login/register: ', error);
      enqueueSnackbar('An error occurred. Please try again.', { variant: 'error' });
    }
  };
  

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className='login-popup-container'>
        <div className='login-popup-title'>
          <h2>{currState}</h2>
          <i 
  className="fa-solid fa-xmark" 
  onClick={() => setShowlogin(false)} 
  style={{ cursor: 'pointer' }} 
  aria-label="Close">
</i>
        </div>
        <div className='login-popup-inputs'>
          {currState === 'Sign Up' && (
            <input
              name='name'
              onChange={onChangeHandler}
              value={data.name}
              type='text'
              placeholder='Your name'
              required={currState === 'Sign Up'}
            />
          )}
          <input
            name='email'
            onChange={onChangeHandler}
            value={data.email}
            type='email'
            placeholder='Your email'
            required
          />
          <input
            name='password'
            onChange={onChangeHandler}
            value={data.password}
            type='password'
            placeholder='Password'
            required
          />
        </div>
        <button type='submit'>{currState === 'Sign Up' ? 'Create account' : 'Login'}</button>
        <div className='login-popup-condition'>
          <input type='checkbox' required />
          <p>By continuing, I agree to the terms of use & privacy policy</p>
        </div>
        {currState === 'Login' ? (
          <p>Create a new account? <span onClick={() => setCurrState('Sign Up')}>Click here</span></p>
        ) : (
          <p>Already have an account? <span onClick={() => setCurrState('Login')}>Login here</span></p>
        )}
        {userName && <p>Welcome back, {userName}!</p>} {/* Display username */}
      </form>
    </div>
  );
};

export default LoginPopup;

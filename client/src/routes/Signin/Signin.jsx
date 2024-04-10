import React from 'react'
import { useNavigate } from "react-router";
import { Input, Stack, Button, ButtonGroup, Link } from '@chakra-ui/react'

import { loginUser } from '../../../lib/utils'

import './Signin.scss'

const Registration = () => {
    // useNavigate is a hook provided by react-router-dom to navigate to different routes
    const navigate = useNavigate()

    // Function to navigate to the signup page
    const toSignup = (event) => {
        event.preventDefault()
        navigate('/signup')
    }

    // React.useState is a hook provided by React to manage state in functional components
    // state variables to manage the username and password
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    // Validation checks
    const isLoginValid = username.length > 0 && password.length > 0;

    // Function to handle the login action
    const handleLogin = async () => {
        if (!isLoginValid) {
            return;
        }
        const response = await loginUser({ username, password });
        if (response instanceof Error) {
            console.error(response);
        }

        console.log(response);

        if (response.username) {
            localStorage.setItem('username', response.username);
            navigate('/home');
        }
    }

    // render the component
  return (
    <React.Fragment>
        <div className='registration-hero-section'>
            <h1 className='registration-logo-name'>README</h1>
        </div>
        <div className='registration-content-section'>
            <div className='registration-title'>
                <p>Sign-in</p>
            </div>
            <div className='registration-form-section'>
                <Stack spacing={3} className='registration-inputs'>
                    <Input placeholder='Username' size='md' value={username} onChange={e => setUsername(e.target.value)}/>
                    <Input type='password' placeholder='Password' size='md' value={password} onChange={e => setPassword(e.target.value)}/>
                </Stack>
                <div className='registration-forgot-link'>
                    <Link>Forgot your password?</Link>
                </div>
                <ButtonGroup gap={3} className='registraion-action-btns'>
                    <Button
                        className='registration-btn'
                        colorScheme='white'
                        color='black'
                        size='md'
                        onClick={toSignup}
                    >
                        Sign up
                    </Button>
                    <Button className='registration-btn' colorScheme='brand' size='md' onClick={handleLogin}>LOGIN</Button>
                </ButtonGroup>  
            </div>
        </div>
        
    </React.Fragment>
  )
}
 
export default Registration
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Stack, Button, ButtonGroup, useToast } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink } from '@chakra-ui/react'

// import { createNewUser } from '../../../../lib/utils'

import './Signup.scss'

const Signup = () => {
    const navigate = useNavigate()
    const toast = useToast()

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [passwordConfirm, setPasswordConfirm] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [firstname, setFirstname] = React.useState('');
    const [lastname, setLastname] = React.useState('');

    const isPasswordConfInvalid = (password.length > 0 && passwordConfirm.length > 0) && (password !== passwordConfirm);
    const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    const isEmailConfInvalid = !emailRegex.test(email) && email.length > 0;
    const isPasswordValid = password.length > 0 && passwordConfirm.length > 0 && password === passwordConfirm;

    const handleSignup = async () => {
        // const response = await createNewUser(username, password, email, firstname, lastname);
        // if (response.status !== 201) {
        //     toast({
        //         title: 'Account creation failed',
        //         status: 'error',
        //         duration: 3000,
        //         isClosable: true,
        //     });
        //     console.error(response);
        //     return;
        // }
        // toast({
        //     title: 'Account created successfully',
        //     status: 'success',
        //     duration: 3000,
        //     isClosable: true,
        // });
        // navigate('/signin');
    }

    return (
        <React.Fragment>
            <div className='registration-hero-section'>
                <h1 className='registration-logo-name'>README</h1>
            </div>
            <div className='registration-content-section'>
                <div className='registration-title'>
                    <p>Sign-up</p>
                </div>
                <div className='registration-form-section'>
                    <Stack spacing={3} className='registration-inputs'>
                        <Input placeholder='Username' size='md' value={username} onChange={e => setUsername(e.target.value)}/>
                        <Input placeholder='First Name' size='md' value={firstname} onChange={e => setFirstname(e.target.value)}/>
                        <Input placeholder='Last Name' size='md' value={lastname} onChange={e => setLastname(e.target.value)}/>
                        <Input placeholder='Email' size='md' value={email} onChange={e => setEmail(e.target.value)}/>
                        {isEmailConfInvalid ? <p className='registration-error-message'>Please enter a valid email</p> : null}
                        <Input type='password' placeholder='Password' size='md' value={password} onChange={e => setPassword(e.target.value)}/>
                        <Input type='password' placeholder='Re-enter password' size='md' value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}/>
                        {isPasswordConfInvalid ? <p className='registration-error-message'>Passwords do not match</p> : null}                      
                    </Stack>
                    <div className='registration-forgot-link'>
                    <ChakraLink as={ReactRouterLink} to='/signin'>
                        Already have an account?
                    </ChakraLink>
                    </div>
                    <ButtonGroup gap={3} className='registraion-action-btns'>
                        <Button
                            className='registration-btn'
                            colorScheme='brand'
                            size='md'
                            type='submit'
                            onClick={handleSignup}
                        >
                            SIGN UP
                        </Button>
                    </ButtonGroup>  
                </div>
            </div>

        </React.Fragment>
    )
}

export default Signup
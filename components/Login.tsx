'use client'
import React, { useState, useEffect } from 'react'
import supabase from '@/utils/supabase'
import { BoldText, ExText } from '@/components/CustomText'
import { useRouter } from 'next/navigation'

function Login() {
    const router = useRouter();
    // email state
    const [email, setEmail] = useState('')
    // password state
    const [password, setPassword] = useState('')
    // loading state
    const [loading, setLoading] = useState(false)
    // error message state
    const [error, setError] = useState('')
    // password visibility state
    const [showPassword, setShowPassword] = useState(false)

    // check if user is already logged in
    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession()
            if (data.session) {
                router.push('/welcome')
            }
        }
        
        checkSession()
    }, [router])

    // handle email change
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (error) {
            setError('')
        }
        setEmail(e.target.value)
    }

    // handle password change
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (error) {
            setError('')
        }
        setPassword(e.target.value)
    }

      // handle login function
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        
        try {
            console.log('Attempting to sign in with:', email);
            
            // First try to sign in normally
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            })
            
            // If sign in works, redirect to welcome page
            if (signInData?.session) {
                console.log('Sign in successful, redirecting...');
                router.push('/welcome');
                return;
            }
            
            // If sign in fails and password is the special one, try to register
            if (signInError && password === 'ColorStudent!') {
                console.log('Attempting to register new account');

                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                })

                if (signUpError) {
                    console.log('Sign up error:', signUpError.message);

                    // If user already exists, try signing in again
                    if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
                        console.log('User already exists, attempting sign in...');
                        const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
                            email,
                            password
                        })

                        if (retrySignIn?.session) {
                            console.log('Sign in successful after registration check');
                            router.push('/welcome');
                            return;
                        } else {
                            setError(retryError?.message || 'Invalid credentials');
                        }
                    } else {
                        setError(signUpError.message || 'Failed to create account');
                    }
                }
                else if (signUpData?.session) {
                    // If we have a session after signup, redirect immediately
                    console.log('Sign up successful, redirecting...');
                    router.push('/welcome');
                }
                else if (signUpData?.user && !signUpData?.session) {
                    // User created but no session (email confirmation disabled but user created)
                    // Try to sign in immediately
                    console.log('User created, attempting immediate sign in...');
                    const { data: immediateSignIn, error: immediateError } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    })

                    if (immediateSignIn?.session) {
                        console.log('Immediate sign in successful');
                        router.push('/welcome');
                    } else {
                        setError('Account created. Please try logging in again.');
                    }
                }
                else {
                    // Supabase sometimes requires email verification first
                    setError('Please check your email to verify your account');
                }
            }
            else if (signInError) {
                // Handle normal login errors
                console.log('Authentication error:', signInError.message);
                setError(signInError.message || 'Invalid credentials');
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className='bg-[#D7D7D7] min-h-[96vh] flex justify-center items-center'>
            <div className='p-10 rounded-2xl shadow bg-[#E6E6E6] w-[420px] border-[#B1B1B1] border-2'>
                <h1 className='text-[#363636] text-2xl text-center font-semibold'>Sign in</h1>
<p className='text-[#676767] text-sm mt-5'>
    Use the password provided in the course.<br />
    Your user name is your email address.
</p>

                <form onSubmit={handleLogin}>
                    <div className='mt-5'>
                        <input 
                            required 
                            type='email' 
                            placeholder='Email address' 
                            value={email}
                            onChange={handleEmailChange}
                            className='text-black w-full p-2 border-[#B1B1B1] border-2 rounded-md' 
                        />
                    </div>
                    <div className='mt-3'>
                        <div className='relative'>
                            <input
                                required
                                value={password}
                                onChange={(e) => handlePasswordChange(e)}
                                type={showPassword ? 'text' : 'password'}
                                placeholder='Password' 
                                className='text-black w-full p-2 border-[#B1B1B1] border-2 rounded-md pr-10' 
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword(prev => !prev)}
                                className='absolute right-2 top-1/2 transform -translate-y-1/2 text-[#676767] text-sm px-1'
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <p className='text-red-500 text-sm px-2 mt-1'>{error}</p>
                    </div>
                    <div className='mt-5 flex justify-end'>
                        <button
                            type='submit'
                            disabled={loading}
                            className='bg-[#919090] text-white w-[100px] p-2 rounded-md disabled:opacity-70'>
                            {loading ? 'Wait...' : 'OK'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
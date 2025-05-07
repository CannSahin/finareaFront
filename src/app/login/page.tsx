// app/login/page.tsx
'use client';

import React, { useState, FormEvent, JSX } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
// import { FcGoogle } from 'react-icons/fc';

interface LoginResponseDto {
    accessToken: string;
    tokenType?: string;
    userEmail?: string;
}

interface ErrorResponseDto {
    message?: string;
    error?: string;
    validationErrors?: Record<string, string>;
    timestamp?: string;
    status?: number;
    path?: string;
}

type ApiResponse = LoginResponseDto | ErrorResponseDto;

export default function LoginPage(): JSX.Element {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const extractErrorMessage = (data: ErrorResponseDto): string => {
        if (data.validationErrors) {
            const firstErrorField = Object.keys(data.validationErrors)[0];
            if (firstErrorField) {
                return `${firstErrorField}: ${data.validationErrors[firstErrorField]}`;
            }
        }
        return data.message || data.error || 'An unexpected error occurred.';
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setValidationErrors({});

        try {
            const response = await fetch(`${API_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            let data: ApiResponse;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', jsonError);
                setError(`Server returned an unexpected response (Status: ${response.status}).`);
                setIsLoading(false);
                return;
            }


            if (response.ok && 'accessToken' in data) {
                console.log('Login successful:', data);
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('userId', data.accessToken);
                router.push('/dashboard');
            } else {
                const errorData = data as ErrorResponseDto;
                const errorMessage = extractErrorMessage(errorData);
                console.error('Login failed:', errorMessage, errorData);
                setError(errorMessage);
                if (errorData.validationErrors) {
                    setValidationErrors(errorData.validationErrors);
                }
            }
        } catch (err) {
            console.error('Network or server error:', err);
            if (err instanceof Error) {
                setError(`Network Error: ${ err.message}. Please check your connection or try again later.`);
            } else {
                setError('An unknown network error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sol Taraf: Resim (Ekranın 2/3'ü - lg ve üzeri için) */}
            <div className="hidden lg:block relative w-0 flex-1 lg:w-2/3">
                <Image
                    src="/images/login.png"
                    alt="Financial planning meeting"
                    layout="fill"
                    objectFit="cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-30"></div>
            </div>

            {/* Sağ Taraf: Login Formu (Ekranın 1/3'ü - lg ve üzeri için) */}
            <div className="flex flex-1 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/3">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-8 flex justify-center lg:justify-start">
                        <Link href="/">
                            <Image src="/images/logoo.png" alt="FinArea Logo" width={140} height={45} priority />
                        </Link>
                    </div>
                    <h2 className="text-sm font-medium text-gray-600 text-center lg:text-left">Personal Financial Planner</h2>
                    <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 text-center lg:text-left">Log in to start saving money!</h1>

                    <div className="mt-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Username or E-mail
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><FiMail /></span>
                                    <input
                                        id="email" name="email" type="email" autoComplete="email" required
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                        className={`block w-full appearance-none rounded-md border px-3 pl-10 py-2 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                        placeholder="you@example.com"
                                        aria-invalid={!!validationErrors.email}
                                        aria-describedby={validationErrors.email ? "email-error" : undefined}
                                    />
                                </div>
                                {validationErrors.email && <p id="email-error" className="mt-1 text-xs text-red-600">{validationErrors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><FiLock /></span>
                                    <input
                                        id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                        className={`block w-full appearance-none rounded-md border px-3 pl-10 pr-10 py-2 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm ${validationErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                        placeholder="********"
                                        aria-invalid={!!validationErrors.password}
                                        aria-describedby={validationErrors.password ? "password-error" : undefined}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none" aria-label={showPassword ? "Hide password" : "Show password"}>
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                                {validationErrors.password && <p id="password-error" className="mt-1 text-xs text-red-600">{validationErrors.password}</p>}
                            </div>

                            {error && !Object.keys(validationErrors).length > 0 && (
                                <div className="rounded-md bg-red-50 p-3">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-red-800">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <FiLogIn className="h-5 w-5 mr-2 -ml-1" />
                                    )}
                                    {isLoading ? 'Logging in...' : 'Log in'}
                                </button>
                            </div>
                        </form>

                        <div className="relative mt-6">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">OR</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                disabled={isLoading}
                                className={`flex w-full items-center justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <svg className="mr-2 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px"><path fill="#EA4335" d="M24 9.5c3.44 0 6.3 1.41 8.28 3.22l6.01-6.01C34.91 3.12 30 1 24 1 14.79 1 7.09 6.97 4.03 15.18l7.34 5.67C12.56 15.18 17.77 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.18 24.45c0-1.65-.15-3.25-.43-4.8H24v9.1h12.58c-.54 2.97-2.18 5.49-4.69 7.22l7.34 5.67C43.28 38.07 46.18 31.89 46.18 24.45z"></path><path fill="#FBBC05" d="M11.37 26.85c-.41-1.23-.64-2.55-.64-3.91s.22-2.68.64-3.91l-7.34-5.67C2.19 16.81 1 20.28 1 24s1.19 7.19 3.03 10.62l7.34-5.77z"></path><path fill="#34A853" d="M24 47c6.4 0 11.8-2.13 15.72-5.78l-7.34-5.67c-2.12 1.42-4.82 2.27-7.99 2.27-6.23 0-11.44-5.68-12.63-11.34L4.03 35.82C7.09 44.03 14.79 47 24 47z"></path><path fill="none" d="M1 1h46v46H1z"></path></svg>
                                Login with Google
                            </button>
                        </div>

                        <div className="mt-8 text-sm text-center space-y-2">
                            <p className="text-gray-600">
                                Don't have an account?{' '}
                                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                    Sign Up
                                </Link>
                            </p>
                            <p className="text-gray-600">
                                Forgot Your Password?{' '}
                                <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                    Reset Password
                                </Link>
                            </p>
                        </div>

                        <div className="mt-6 text-xs text-gray-500 text-center">
                            <Link href="/terms" className="hover:underline">Terms of service</Link>
                            {' and '}
                            <Link href="/privacy" className="hover:underline">Privacy policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
'use client';

import React, { useState, FormEvent, JSX } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

// Backend'den gelen başarılı yanıt (kullanılmayabilir ama tipi tanımlı olsun)
interface UserResponseDto {
    userId: string; // UUID string olarak gelebilir
    name: string;
    surname: string;
    email: string;
    telNo?: string;
    createdAt: string; // Veya Date/OffsetDateTime tipi
    updatedAt: string; // Veya Date/OffsetDateTime tipi
}

// Hata yanıtı tipi (Login sayfasındakine benzer)
interface ErrorResponseDto {
    message?: string;
    error?: string;
    validationErrors?: Record<string, string>;
}

type RegisterApiResponse = UserResponseDto | ErrorResponseDto;

export default function RegisterPage(): JSX.Element {
    const [name, setName] = useState<string>('');
    const [surname, setSurname] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [telNo, setTelNo] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setValidationErrors({});

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setValidationErrors({ password: " ", confirmPassword: "Passwords do not match." }); // Alanları işaretle
            setIsLoading(false);
            return;
        }

        const userData = { name, surname, email, telNo: telNo || null, password }; // TelNo boşsa null gönderilebilir

        try {
            const response = await fetch(`${API_URL}/api/v1/users`, { // Endpoint: /api/v1/users
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            // Başarılı yanıt (201 Created) veya hatalı yanıtı işle
            if (response.status === 201) { // Genellikle POST ile oluşturmada 201 döner
                const data: UserResponseDto = await response.json(); // Başarılı yanıtı al
                console.log('Registration successful:', data);
                // Başarılı kayıt sonrası kullanıcıyı login sayfasına yönlendir
                // Opsiyonel: Başarı mesajı gösterebilirsiniz
                alert('Registration successful! Please log in.'); // Basit alert
                router.push('/login');
            } else {
                // Hata durumunu işle (400 Bad Request, 409 Conflict vb.)
                let errorData: ErrorResponseDto = {};
                try {
                    errorData = await response.json(); // Hata detaylarını JSON olarak almayı dene
                } catch(jsonError) {
                    console.error("Could not parse error response JSON", jsonError)
                }

                let errorMessage = 'Registration failed. Please check your input or try again.'; // Varsayılan
                if (typeof errorData === 'object' && errorData !== null) {
                    if (errorData.validationErrors && typeof errorData.validationErrors === 'object') {
                        setValidationErrors(errorData.validationErrors);
                        // İlk validasyon hatasını genel hata olarak da göster
                        const firstErrorField = Object.keys(errorData.validationErrors)[0];
                        errorMessage = `${firstErrorField}: ${errorData.validationErrors[firstErrorField]}`;
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } else if (!response.ok) {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }

                console.error('Registration failed:', errorMessage, errorData);
                setError(errorMessage); // Genel hata mesajını göster
            }
        } catch (err) {
            console.error('Network or server error during registration:', err);
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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-lg">
                {/* Logo ve Başlık */}
                <div>
                    <div className="mx-auto flex justify-center">
                        <Link href="/">
                            <Image src="/images/logoo.png" alt="FinArea Logo" width={140} height={45} priority />
                        </Link>
                    </div>
                    <h2 className="mt-6 text-center text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                        Create your FinArea account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Log in here
                        </Link>
                    </p>
                </div>

                {/* Kayıt Formu */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* Genel Hata Mesajı */}
                    {error && !Object.keys(validationErrors).length && (
                        <div className="rounded-md bg-red-50 p-3">
                            <p className="text-sm font-medium text-red-800 text-center">{error}</p>
                        </div>
                    )}

                    {/* İsim Soyisim */}
                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
                        <div className="flex-1">
                            <label htmlFor="name" className="sr-only">Name</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><FiUser /></span>
                                <input
                                    id="name" name="name" type="text" autoComplete="given-name" required
                                    value={name} onChange={(e) => setName(e.target.value)}
                                    className={`block w-full appearance-none rounded-md border px-3 pl-10 py-2 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                    placeholder="Name"
                                    aria-invalid={!!validationErrors.name}
                                    aria-describedby={validationErrors.name ? "name-error" : undefined}
                                />
                            </div>
                            {validationErrors.name && <p id="name-error" className="mt-1 text-xs text-red-600">{validationErrors.name}</p>}
                        </div>
                        <div className="flex-1">
                            <label htmlFor="surname" className="sr-only">Surname</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><FiUser /></span>
                                <input
                                    id="surname" name="surname" type="text" autoComplete="family-name" required
                                    value={surname} onChange={(e) => setSurname(e.target.value)}
                                    className={`block w-full appearance-none rounded-md border px-3 pl-10 py-2 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm ${validationErrors.surname ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                    placeholder="Surname"
                                    aria-invalid={!!validationErrors.surname}
                                    aria-describedby={validationErrors.surname ? "surname-error" : undefined}
                                />
                            </div>
                            {validationErrors.surname && <p id="surname-error" className="mt-1 text-xs text-red-600">{validationErrors.surname}</p>}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><FiMail /></span>
                            <input
                                id="email" name="email" type="email" autoComplete="email" required
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                className={`block w-full appearance-none rounded-md border px-3 pl-10 py-2 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                placeholder="Email address"
                                aria-invalid={!!validationErrors.email}
                                aria-describedby={validationErrors.email ? "email-error" : undefined}
                            />
                        </div>
                        {validationErrors.email && <p id="email-error" className="mt-1 text-xs text-red-600">{validationErrors.email}</p>}
                    </div>

                    {/* Telefon (Opsiyonel) */}
                    <div>
                        <label htmlFor="telNo" className="sr-only">Phone Number (Optional)</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><FiPhone /></span>
                            <input
                                id="telNo" name="telNo" type="tel" autoComplete="tel"
                                value={telNo} onChange={(e) => setTelNo(e.target.value)}
                                className={`block w-full appearance-none rounded-md border border-gray-300 px-3 pl-10 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                                placeholder="Phone Number (Optional)"
                            />
                        </div>
                    </div>


                    {/* Şifre */}
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><FiLock /></span>
                            <input
                                id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={6}
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                className={`block w-full appearance-none rounded-md border px-3 pl-10 pr-10 py-2 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm ${validationErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                placeholder="Password (min. 6 characters)"
                                aria-invalid={!!validationErrors.password}
                                aria-describedby={validationErrors.password ? "password-error" : undefined}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {validationErrors.password && <p id="password-error" className="mt-1 text-xs text-red-600">{validationErrors.password}</p>}
                    </div>

                    {/* Şifre Tekrarı */}
                    <div>
                        <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><FiLock /></span>
                            <input
                                id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={6}
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`block w-full appearance-none rounded-md border px-3 pl-10 pr-10 py-2 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm ${validationErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                placeholder="Confirm Password"
                                aria-invalid={!!validationErrors.confirmPassword}
                                aria-describedby={validationErrors.confirmPassword ? "confirmPassword-error" : undefined}
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {validationErrors.confirmPassword && <p id="confirmPassword-error" className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>}
                    </div>

                    {/* Kayıt Butonu */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" /* ... */ >{/* SVG Path */}</svg>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </div>
                </form>

                {/* Terms ve Privacy */}
                <div className="mt-6 text-xs text-gray-500 text-center">
                    By signing up, you agree to our{' '}
                    <Link href="/terms" className="hover:underline font-medium text-blue-600">Terms of Service</Link>
                    {' and '}
                    <Link href="/privacy" className="hover:underline font-medium text-blue-600">Privacy Policy</Link>
                    .
                </div>
            </div>
        </div>
    );
}
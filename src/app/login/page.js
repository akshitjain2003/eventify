"use client"
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

const Page = () => {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState('user');
    const [userFormType, setUserFormType] = useState('login');
    const [venueFormType, setVenueFormType] = useState('login');
    const [previewImages, setPreviewImages] = useState([]);
    const fileInputRef = useRef(null);

    // User Login Form
    const {
        register: userLoginRegister,
        handleSubmit: handleUserLoginSubmit,
        formState: { errors: userLoginErrors }
    } = useForm();

    // User Signup Form
    const {
        register: userSignupRegister,
        handleSubmit: handleUserSignupSubmit,
        formState: { errors: userSignupErrors }
    } = useForm();

    // Venue Login Form
    const {
        register: venueLoginRegister,
        handleSubmit: handleVenueLoginSubmit,
        formState: { errors: venueLoginErrors }
    } = useForm();

    // Venue Signup Form
    const {
        register: venueSignupRegister,
        handleSubmit: handleVenueSignupSubmit,
        setValue,
        formState: { errors: venueSignupErrors }
    } = useForm();

    // Toggle between User and Venue
    const switchToUser = () => setActiveSection('user');
    const switchToVenue = () => setActiveSection('venue');

    // User form toggles
    const showUserSignup = () => setUserFormType('signup');
    const showUserLogin = () => setUserFormType('login');

    // Venue form toggles
    const showVenueSignup = () => setVenueFormType('signup');
    const showVenueLogin = () => setVenueFormType('login');

    // Image preview functionality
    const handleImageChange = (event) => {
        const files = event.target.files;
        const images = [];

        for (let i = 0; i < files.length && i < 5; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = (e) => {
                images.push(e.target.result);
                if (images.length === Math.min(files.length, 5)) {
                    setPreviewImages(images);
                }
            };

            reader.readAsDataURL(file);
        }
        setValue('venueImages', files[0])
    };

    // Form submission handlers
    const onUserLogin = async (data) => {

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: data.email,
                password: data.password,
                accountType: 'user'
            }),
        });
        const res = await response.json();
        console.log(res);
        if (response.ok) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));

            router.push('/');
        } else {
            alert(data.error || 'Login failed');
        }
    };

    const onUserSignup = async (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('age', data.age);
        const response = await fetch('/api/auth/user/signup', {
            method: 'POST',
            body: formData,
        });
        const res = await response.json();
        console.log(res);

    };

    const onVenueLogin = async (data) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: data.email,
                password: data.password,
                accountType: 'venue'
            }),
        });
        const res = await response.json();
        if (response.ok) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('venue', JSON.stringify(res.venue));

            router.push('/dashboard');
        } else {
            alert(data.error || 'Login failed');
        }

    };

    const onVenueSignup = async (data) => {
        alert(`Venue Signup:\nVenue Name: ${data.venueName}\nEmail: ${data.email}\nContact: ${data.contact}\nLocation: ${data.location}\nPassword: ${data.password}`);
        const formData = new FormData();
        formData.append('venueName', data.venueName);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('contact', data.contact);
        formData.append('location', data.location);
        formData.append('images', data.venueImages);
        console.log(data)
        const response = await fetch('/api/auth/venue/signup', {
            method: 'POST',
            body: formData,
        });
        const res = await response.json();
        console.log(res);
    };

    // Google authentication handlers
    const signInWithGoogle = () => {
        alert('Google Sign In functionality would be implemented here with Google OAuth');
    };

    const signUpWithGoogle = () => {
        alert('Google Sign Up functionality would be implemented here with Google OAuth');
    };

    return (
        <div>
            <div className="topbar">
                <div className="logo-container">
                    <div className="logo">
                        <img id="logo-topbar" src="Eventify - Copy.png" alt="logo" />
                    </div>
                </div>
            </div>
            <div className="main-content">
                <div className="login-container">
                    {/* Toggle Between User and Venue */}
                    <div className="toggle-container">
                        <button
                            className={`toggle-btn ${activeSection === 'user' ? 'active' : ''}`}
                            onClick={switchToUser}
                        >
                            User
                        </button>
                        <button
                            className={`toggle-btn ${activeSection === 'venue' ? 'active' : ''}`}
                            onClick={switchToVenue}
                        >
                            Venue
                        </button>
                        <div className={`toggle-slider ${activeSection === 'venue' ? 'venue' : ''}`} />
                    </div>

                    {/* User Section */}
                    <div className={`form-section ${activeSection === 'user' ? 'active' : ''}`}>
                        <div className="section-header">
                            <h2>Welcome Back</h2>
                            <p>Sign in to your account</p>
                        </div>

                        {/* User Login Form */}
                        {userFormType === 'login' ? (
                            <div className="form-container">
                                <form onSubmit={handleUserLoginSubmit(onUserLogin)}>
                                    <div className="form-group">
                                        <label htmlFor="userEmail">Gmail ID</label>
                                        <input
                                            type="email"
                                            id="userEmail"
                                            placeholder="Enter your Gmail ID"
                                            {...userLoginRegister("email", {
                                                required: "Email is required",
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: "Invalid email address"
                                                }
                                            })}
                                        />
                                        {userLoginErrors.email && (
                                            <p className="error-message">{userLoginErrors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="userPassword">Password</label>
                                        <input
                                            type="password"
                                            id="userPassword"
                                            placeholder="Enter your password"
                                            {...userLoginRegister("password", {
                                                required: "Password is required",
                                                minLength: {
                                                    value: 6,
                                                    message: "Password must be at least 6 characters"
                                                }
                                            })}
                                        />
                                        {userLoginErrors.password && (
                                            <p className="error-message">{userLoginErrors.password.message}</p>
                                        )}
                                    </div>
                                    <button type="submit" className="btn-primary">
                                        Sign In
                                    </button>
                                </form>
                                <div className="divider">
                                    <span>or</span>
                                </div>
                                <button type="button" className="btn-google" onClick={signInWithGoogle}>
                                    <svg width={20} height={20} viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </button>
                                <div className="toggle-link">
                                    <span>Don't have an account? </span>
                                    <button type="button" onClick={showUserSignup}>
                                        Create Account
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* User Signup Form */
                            <div className="form-container">
                                <form onSubmit={handleUserSignupSubmit(onUserSignup)}>
                                    <div className="form-group">
                                        <label htmlFor="userName">Full Name</label>
                                        <input
                                            type="text"
                                            id="userName"
                                            placeholder="Enter your full name"
                                            {...userSignupRegister("name", {
                                                required: "Name is required",
                                                minLength: {
                                                    value: 2,
                                                    message: "Name must be at least 2 characters"
                                                }
                                            })}
                                        />
                                        {userSignupErrors.name && (
                                            <p className="error-message">{userSignupErrors.name.message}</p>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="userAge">Age</label>
                                        <input
                                            type="number"
                                            id="userAge"
                                            placeholder="Enter your age"
                                            min={13}
                                            max={120}
                                            {...userSignupRegister("age", {
                                                required: "Age is required",
                                                min: {
                                                    value: 13,
                                                    message: "You must be at least 13 years old"
                                                },
                                                max: {
                                                    value: 120,
                                                    message: "Please enter a valid age"
                                                }
                                            })}
                                        />
                                        {userSignupErrors.age && (
                                            <p className="error-message">{userSignupErrors.age.message}</p>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="userSignupEmail">Gmail ID</label>
                                        <input
                                            type="email"
                                            id="userSignupEmail"
                                            placeholder="Enter your Gmail ID"
                                            {...userSignupRegister("email", {
                                                required: "Email is required",
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: "Invalid email address"
                                                }
                                            })}
                                        />
                                        {userSignupErrors.email && (
                                            <p className="error-message">{userSignupErrors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="userSignupPassword">Create Password</label>
                                        <input
                                            type="password"
                                            id="userSignupPassword"
                                            placeholder="Create a unique password"
                                            {...userSignupRegister("password", {
                                                required: "Password is required",
                                                minLength: {
                                                    value: 6,
                                                    message: "Password must be at least 6 characters"
                                                }
                                            })}
                                        />
                                        {userSignupErrors.password && (
                                            <p className="error-message">{userSignupErrors.password.message}</p>
                                        )}
                                    </div>
                                    <button type="submit" className="btn-primary">
                                        Create Account
                                    </button>
                                </form>
                                <div className="divider">
                                    <span>or</span>
                                </div>
                                <button type="button" className="btn-google" onClick={signUpWithGoogle}>
                                    <svg width={20} height={20} viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Sign Up with Google
                                </button>
                                <div className="toggle-link">
                                    <span>Already have an account? </span>
                                    <button type="button" onClick={showUserLogin}>
                                        Sign In
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Venue Section */}
                    <div className={`form-section ${activeSection === 'venue' ? 'active' : ''}`}>
                        <div className="section-header">
                            <h2>Venue Portal</h2>
                            <p>Manage your venue listings</p>
                        </div>

                        {/* Venue Login Form */}
                        {venueFormType === 'login' ? (
                            <div className="form-container">
                                <form onSubmit={handleVenueLoginSubmit(onVenueLogin)}>
                                    <div className="form-group">
                                        <label htmlFor="venueEmail">Gmail ID</label>
                                        <input
                                            type="email"
                                            id="venueEmail"
                                            placeholder="Enter your Gmail ID"
                                            {...venueLoginRegister("email", {
                                                required: "Email is required",
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: "Invalid email address"
                                                }
                                            })}
                                        />
                                        {venueLoginErrors.email && (
                                            <p className="error-message">{venueLoginErrors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="venuePassword">Password</label>
                                        <input
                                            type="password"
                                            id="venuePassword"
                                            placeholder="Enter your password"
                                            {...venueLoginRegister("password", {
                                                required: "Password is required",
                                                minLength: {
                                                    value: 6,
                                                    message: "Password must be at least 6 characters"
                                                }
                                            })}
                                        />
                                        {venueLoginErrors.password && (
                                            <p className="error-message">{venueLoginErrors.password.message}</p>
                                        )}
                                    </div>
                                    <button type="submit" className="btn-primary">
                                        Sign In
                                    </button>
                                </form>
                                <div className="toggle-link">
                                    <span>Don't have a venue account? </span>
                                    <button type="button" onClick={showVenueSignup}>
                                        Create Account
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Venue Signup Form */
                            <div className="form-container">
                                <form onSubmit={handleVenueSignupSubmit(onVenueSignup)}>
                                    <div className="form-group">
                                        <label htmlFor="venueName">Venue Name</label>
                                        <input
                                            type="text"
                                            id="venueName"
                                            placeholder="Enter your venue name"
                                            {...venueSignupRegister("venueName", {
                                                required: "Venue name is required",
                                                minLength: {
                                                    value: 2,
                                                    message: "Venue name must be at least 2 characters"
                                                }
                                            })}
                                        />
                                        {venueSignupErrors.venueName && (
                                            <p className="error-message">{venueSignupErrors.venueName.message}</p>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="venueSignupEmail">Gmail ID</label>
                                        <input
                                            type="email"
                                            id="venueSignupEmail"
                                            placeholder="Enter your Gmail ID"
                                            {...venueSignupRegister("email", {
                                                required: "Email is required",
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: "Invalid email address"
                                                }
                                            })}
                                        />
                                        {venueSignupErrors.email && (
                                            <p className="error-message">{venueSignupErrors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="venueContact">Contact Number</label>
                                        <input
                                            type="tel"
                                            id="venueContact"
                                            placeholder="Enter contact number"
                                            {...venueSignupRegister("contact", {
                                                required: "Contact number is required",
                                                pattern: {
                                                    value: /^[0-9]{10,15}$/,
                                                    message: "Please enter a valid phone number"
                                                }
                                            })}
                                        />
                                        {venueSignupErrors.contact && (
                                            <p className="error-message">{venueSignupErrors.contact.message}</p>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="venueLocation">Location</label>
                                        <textarea
                                            id="venueLocation"
                                            placeholder="Enter venue address/location"
                                            rows={3}
                                            {...venueSignupRegister("location", {
                                                required: "Location is required",
                                                minLength: {
                                                    value: 10,
                                                    message: "Location must be at least 10 characters"
                                                }
                                            })}
                                        />
                                        {venueSignupErrors.location && (
                                            <p className="error-message">{venueSignupErrors.location.message}</p>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="venueSignupPassword">Create Password</label>
                                        <input
                                            type="password"
                                            id="venueSignupPassword"
                                            placeholder="Create a secure password"
                                            {...venueSignupRegister("password", {
                                                required: "Password is required",
                                                minLength: {
                                                    value: 6,
                                                    message: "Password must be at least 6 characters"
                                                }
                                            })}
                                        />
                                        {venueSignupErrors.password && (
                                            <p className="error-message">{venueSignupErrors.password.message}</p>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="venueImages">Add Venue Images</label>
                                        <div className="file-input-container">
                                            <input
                                                type="file"
                                                id="venueImages"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                                ref={fileInputRef}
                                                style={{ display: 'none' }}
                                            />
                                            <label htmlFor="venueImages" className="file-input-label" onClick={() => fileInputRef.current.click()}>
                                                📸 Click to add venue images
                                            </label>
                                        </div>
                                        <div className="image-preview">
                                            {previewImages.map((img, index) => (
                                                <img key={index} src={img} alt={`Preview ${index}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-primary">
                                        Create Venue Account
                                    </button>
                                </form>
                                <div className="toggle-link">
                                    <span>Already have a venue account? </span>
                                    <button type="button" onClick={showVenueLogin}>
                                        Sign In
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
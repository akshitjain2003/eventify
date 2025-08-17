"use client"
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

const ContactPage = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm();

    useEffect(() => {
        // Get user info and pre-fill the ID field
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const venue = JSON.parse(localStorage.getItem('venue') || '{}');
                
                // Pre-fill with email based on account type
                if (decoded.accountType === 'user' && user.email) {
                    setValue('id', user.email);
                } else if (decoded.accountType === 'venue' && venue.email) {
                    setValue('id', venue.email);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, [setValue]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            // Determine user type from token
            const token = localStorage.getItem('token');
            let userType = 'user'; // default
            
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    userType = decoded.accountType || 'user';
                } catch (error) {
                    console.error('Error decoding token:', error);
                }
            }

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: data.id,
                    feedback: data.feedback,
                    userType: userType
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitMessage('Thank you for your feedback! We will get back to you soon.');
                reset();
            } else {
                setSubmitMessage(result.error || 'Failed to submit feedback. Please try again.');
            }
        } catch (error) {
            setSubmitMessage('An error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gray-100">
            {/* Content */}
            <div className="relative" style={{ zIndex: 10 }}>
                <div className="topbar">
                    <div className="logo-container">
                        <div className="logo">
                            <img id="logo-topbar" src="Eventify - Copy.png" alt="logo" />
                        </div>
                    </div>
                </div>
                <div className="main-content">
                    <div className="login-container">
                        <div className="section-header">
                            <h2>Contact Us</h2>
                            <p>We'd love to hear your feedback!</p>
                        </div>

                        <div className="form-container">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="form-group">
                                    <label htmlFor="id">Your ID/Email</label>
                                    <input
                                        type="text"
                                        id="id"
                                        placeholder="Enter your ID or email"
                                        readOnly
                                        {...register("id", {
                                            required: "ID/Email is required",
                                            minLength: {
                                                value: 3,
                                                message: "ID must be at least 3 characters"
                                            }
                                        })}
                                        style={{
                                            backgroundColor: '#f5f5f5',
                                            cursor: 'not-allowed'
                                        }}
                                    />
                                    {errors.id && (
                                        <p className="error-message">{errors.id.message}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="feedback">Feedback</label>
                                    <textarea
                                        id="feedback"
                                        placeholder="Please share your feedback, suggestions, or report any issues..."
                                        rows={6}
                                        {...register("feedback", {
                                            required: "Feedback is required",
                                            minLength: {
                                                value: 10,
                                                message: "Feedback must be at least 10 characters"
                                            }
                                        })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontFamily: 'inherit',
                                            resize: 'vertical'
                                        }}
                                    />
                                    {errors.feedback && (
                                        <p className="error-message">{errors.feedback.message}</p>
                                    )}
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </form>

                            {submitMessage && (
                                <div className={`message ${submitMessage.includes('Thank you') ? 'success' : 'error'}`}>
                                    {submitMessage}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Back Button - Bottom Right */}
                <button
                    onClick={() => router.back()}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
                    title="Go Back"
                >
                    <span className="text-xl">←</span>
                </button>
            </div>
        </div>
    );
};

export default ContactPage;

















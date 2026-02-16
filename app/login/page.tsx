"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

const LoginContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Login state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Register state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (searchParams?.get("register") === "true") {
            setIsRegistering(true);
        }
    }, [searchParams]);

    const toggleForm = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsRegistering(!isRegistering);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message || 'Login successful!');
                // Wait a moment for the toast
                setTimeout(() => {
                    router.push(data.redirect);
                }, 1000);
            } else {
                toast.error(data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("An error occurred during login. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (registerPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        // Note: Registration API not implemented yet in this turn, but planned
        toast.loading("Registration coming soon...");
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <main>
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap");

                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                  font-family: "Open Sans", sans-serif;
                }

                body {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  width: 100%;
                  padding: 0 10px;
                  position: relative;
                  overflow: hidden;
                }

                body::before {
                  content: "";
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  background: url("/assets/images/login-hero-bg.jpg") center/cover no-repeat;
                  filter: brightness(0.7);
                }

                .wrapper {
                  width: 400px;
                  border-radius: 12px;
                  padding: 40px 30px;
                  text-align: center;
                  border: 1px solid rgba(255, 255, 255, 0.25);
                  backdrop-filter: blur(12px);
                  -webkit-backdrop-filter: blur(12px);
                  background: rgba(255, 255, 255, 0.06);
                  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
                  position: relative;
                  z-index: 2;
                }

                h2 {
                  font-size: 1.6rem;
                  margin-bottom: 8px;
                  color: #fff;
                  font-weight: 700;
                  letter-spacing: 0.6px;
                  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                }

                .sub-title {
                  font-size: 0.9rem;
                  color: #f6ebeb;
                  margin-bottom: 12px;
                  font-weight: 400;
                  letter-spacing: 0.3px;
                }

                form {
                  display: flex;
                  flex-direction: column;
                }

                .input-field {
                  position: relative;
                  margin: 14px 0;
                }

                .heading-image {
                  width: 70px;
                  height: auto;
                  display: block;
                  margin: 0 auto;
                  object-fit: contain;
                  padding: 12px 0;
                }

                .heading-image:hover {
                  transform: scale(1.05);
                  transition: 0.3s ease;
                }

                .input-field input {
                  width: 100%;
                  height: 45px;
                  background: rgba(255, 255, 255, 0.08) !important;
                  border: 1px solid rgba(255, 255, 255, 0.25);
                  border-radius: 8px;
                  outline: none;
                  font-size: 16px;
                  color: #fff !important;
                  padding: 0 40px 0 12px;
                  transition: all 0.3s ease;
                }

                .input-field input:-webkit-autofill,
                .input-field input:-webkit-autofill:hover,
                .input-field input:-webkit-autofill:focus,
                .input-field input:-webkit-autofill:active {
                  -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.08) inset !important;
                  -webkit-text-fill-color: #fff !important;
                  transition: background-color 5000s ease-in-out 0s;
                }

                .input-field input:focus {
                  border-color: #fff;
                  background: rgba(255, 255, 255, 0.15) !important;
                }

                .input-field label {
                  position: absolute;
                  top: 50%;
                  left: 12px;
                  transform: translateY(-50%);
                  color: rgba(255, 255, 255, 0.7);
                  font-size: 15px;
                  pointer-events: none;
                  transition: all 0.25s ease;
                }

                .input-field input:focus~label,
                .input-field input:valid~label,
                .input-field input:-webkit-autofill~label,
                .input-field input.has-value~label {
                  font-size: 0.75rem;
                  top: -15px;
                  color: #fff;
                }

                .eye-icon {
                  position: absolute;
                  right: 12px;
                  top: 50%;
                  transform: translateY(-50%);
                  cursor: pointer;
                  font-size: 16px;
                  color: rgba(255, 255, 255, 0.6);
                  transition: opacity 0.3s ease, color 0.3s ease;
                }

                .eye-icon:hover {
                  color: #fff;
                }

                .forget {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  margin: 25px 0 35px 0;
                  color: #fff;
                  font-size: 0.9rem;
                }

                .forget label {
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  cursor: pointer;
                }

                .forget label p {
                  margin: 0;
                }

                #remember {
                  accent-color: #fff;
                }

                .wrapper a {
                  color: #efefef;
                  text-decoration: none;
                  transition: 0.3s ease;
                }

                .wrapper a:hover {
                  text-decoration: underline;
                }

                button {
                  background: linear-gradient(135deg, #ffffff 0%, #e4e4e4 100%);
                  color: #000;
                  font-weight: 700;
                  border: none;
                  padding: 12px 20px;
                  cursor: pointer;
                  border-radius: 8px;
                  font-size: 16px;
                  transition: 0.3s ease;
                  box-shadow: 0 3px 8px rgba(255, 255, 255, 0.2);
                }

                button:hover {
                  background: rgba(255, 255, 255, 0.15);
                  color: #fff;
                  border: 1px solid #fff;
                  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
                }

                .auth-switch {
                  margin-top: 20px;
                  text-align: center;
                }

                .auth-switch p {
                  color: rgba(255, 255, 255, 0.8);
                  font-size: 0.9rem;
                }

                .auth-switch a {
                  color: #fff;
                  font-weight: 600;
                  text-decoration: none;
                  transition: 0.3s ease;
                }

                .auth-switch a:hover {
                  text-decoration: underline;
                  color: #e0e0e0;
                }

                .divider {
                  display: flex;
                  align-items: center;
                  margin: 20px 0;
                  color: rgba(255, 255, 255, 0.6);
                }

                .divider-line {
                  flex: 1;
                  height: 1px;
                  background: rgba(255, 255, 255, 0.2);
                }

                .divider-text {
                  padding: 0 10px;
                  font-size: 0.8rem;
                }

                .google-btn {
                  width: 100%;
                  background: #fff;
                  color: #444;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  padding: 10px 15px;
                  font-weight: 600;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 12px;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  font-size: 15px;
                  text-decoration: none;
                }

                .google-btn:hover {
                  background: #f7f7f7;
                  border-color: #ccc;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }

                .google-icon {
                  width: 20px;
                  height: 20px;
                }

                @media (max-width: 1028px) {
                  .wrapper {
                    width: 85%;
                    padding: 35px 30px;
                    min-height: auto;
                  }
                  h2 { font-size: 1.4rem; }
                  .sub-title { font-size: 0.85rem; margin-bottom: 8px; }
                  .input-field { margin: 18px 0; }
                  button { font-size: 15px; padding: 10px 18px; }
                  .forget { margin: 20px 0 25px 0; }
                  .auth-switch { margin-top: 15px; }
                  .heading-image { width: 60px; padding: 8px 0; }
                }

                @media (max-width: 768px) {
                  .wrapper { width: 95%; padding: 25px 20px; min-height: auto; }
                  .heading-image { width: 50px; padding: 6px 0; }
                  h2 { font-size: 1.2rem; margin-bottom: 6px; }
                  .sub-title { font-size: 0.8rem; margin-bottom: 6px; }
                  .input-field { margin: 12px 0; }
                  .input-field input { height: 40px; font-size: 15px; padding: 0 35px 0 10px; }
                  button { font-size: 14px; padding: 10px 16px; }
                  .forget { flex-direction: row; align-items: center; justify-content: space-between; gap: 6px; margin: 15px 0 20px 0; }
                  .auth-switch { margin-top: 12px; }
                }

                @media (max-width: 430px) {
                  .wrapper { width: 95%; padding: 20px 15px; min-height: auto; margin: 0 auto; }
                  .heading-image { width: 45px; padding: 4px 0; }
                  h2 { font-size: 1.1rem; margin-bottom: 5px; }
                  .sub-title { font-size: 0.75rem; margin-bottom: 5px; }
                  .input-field { margin: 15px 0; }
                  .input-field input { height: 38px; font-size: 14px; padding: 0 30px 0 10px; }
                  button { font-size: 13px; padding: 9px 14px; }
                  .forget { flex-direction: row; align-items: center; justify-content: space-between; gap: 5px; margin: 12px 0 18px 0; }
                  .auth-switch { margin-top: 10px; }
                }
            `}} />
            {!isRegistering ? (
                <div className="wrapper">
                    <img
                        src="/assets/images/church-logo.png"
                        alt="Church Logo"
                        className="heading-image"
                    />
                    <h2>Solution Arena Ministry</h2>
                    <p className="sub-title">Sign In To Site</p>

                    <form onSubmit={handleLogin}>
                        <div className="input-field">
                            <input
                                type="text"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={email ? "has-value" : ""}
                            />
                            <label>Enter your email</label>
                        </div>

                        <div className="input-field">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={password ? "has-value" : ""}
                            />
                            <label>Enter your password</label>
                            <i
                                className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"} eye-icon`}
                                onClick={() => setShowPassword(!showPassword)}
                            ></i>
                        </div>

                        <div className="forget">
                            <label htmlFor="remember">
                                <input type="checkbox" id="remember" />
                                <p>Remember me</p>
                            </label>
                            <a href="#">Forgot password?</a>
                        </div>

                        <button type="submit">Log In</button>

                        <div className="divider">
                            <div className="divider-line"></div>
                            <span className="divider-text">OR</span>
                            <div className="divider-line"></div>
                        </div>

                        <div className="google-btn">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="google-icon" />
                            Sign in with Google
                        </div>
                    </form>

                    <div className="auth-switch">
                        <p>
                            Don't have an account?{" "}
                            <a href="#" onClick={toggleForm}>Register</a>
                        </p>
                    </div>
                </div>
            ) : (
                <div className="wrapper">
                    <img
                        src="/assets/images/church-logo.png"
                        alt="Church Logo"
                        className="heading-image"
                    />
                    <h2>Create Account</h2>
                    <p className="sub-title">Register for Church Management System</p>

                    <form onSubmit={handleRegister}>
                        <div className="input-field">
                            <input
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={firstName ? "has-value" : ""}
                            />
                            <label>First Name</label>
                        </div>

                        <div className="input-field">
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={lastName ? "has-value" : ""}
                            />
                            <label>Last Name</label>
                        </div>

                        <div className="input-field">
                            <input
                                type="email"
                                required
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
                                className={registerEmail ? "has-value" : ""}
                            />
                            <label>Email Address</label>
                        </div>

                        <div className="input-field">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                className={registerPassword ? "has-value" : ""}
                            />
                            <label>Password</label>
                            <i
                                className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"} eye-icon`}
                                onClick={() => setShowPassword(!showPassword)}
                            ></i>
                        </div>

                        <div className="input-field">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={confirmPassword ? "has-value" : ""}
                            />
                            <label>Confirm Password</label>
                        </div>

                        <button type="submit">Register</button>

                        <div className="divider">
                            <div className="divider-line"></div>
                            <span className="divider-text">OR</span>
                            <div className="divider-line"></div>
                        </div>

                        <div className="google-btn">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="google-icon" />
                            Sign up with Google
                        </div>
                    </form>

                    <div className="auth-switch">
                        <p>
                            Already have an account?{" "}
                            <a href="#" onClick={toggleForm}>Log In</a>
                        </p>
                    </div>
                </div>
            )}

            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        </main>
    );
};

const LoginPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
};

export default LoginPage;

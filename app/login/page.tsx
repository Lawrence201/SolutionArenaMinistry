"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";

const LoginContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [lastUsedName, setLastUsedName] = useState<string | null>(null);
  const [lastUsedEmail, setLastUsedEmail] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setLastUsedName(localStorage.getItem("last_used_name"));
      setLastUsedEmail(localStorage.getItem("last_used_email"));
    }
  }, []);

  const [isRegistering, setIsRegistering] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    if (searchParams?.get("register") === "true") {
      setIsRegistering(true);
    }
  }, [searchParams]);

  const toggleForm = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRegistering((prev) => !prev);
  };

  // ─── Handlers (simplified) ──────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      toast.error("Please enter both email and password.");
      return;
    }

    const toastId = toast.loading("Verifying credentials...");

    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password", { id: toastId });
      } else {
        toast.success("Login successful!", { id: toastId });

        // Fetch the updated session to determine the user's role
        try {
          const sessionRes = await fetch("/api/auth/session");
          const sessionData = await sessionRes.json();
          const role = sessionData?.user?.role;

          if (role === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/"); // Regular members go to the website
          }
        } catch {
          // Fallback: if we can't read the session, assume admin (credentials are typically for admins)
          router.push("/admin/dashboard");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred", { id: toastId });
    }
  };

  return (
    <>
      <Toaster position="top-center" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap");

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: "Open Sans", sans-serif;
            }

            html, body {
              height: 100%;
              overflow: hidden;
            }

            body {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              width: 100%;
              padding: 0 10px;
              position: relative;
            }

            body::before {
              content: "";
              position: absolute;
              width: 100%;
              height: 100%;
              background: url("/assets/images/login-hero-bg.jpg") center/cover no-repeat;
              filter: brightness(0.7);
              z-index: -1;
            }

            .wrapper {
              width: 400px;
              border-radius: 12px;
              padding: 40px 30px;
              text-align: center;
              border: 1px solid rgba(255,255,255,0.25);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              background: rgba(255,255,255,0.06);
              box-shadow: 0 4px 30px rgba(0,0,0,0.3);
              position: relative;
              z-index: 2;
            }

            h2 {
              font-size: 1.6rem;
              margin-bottom: 10px;
              color: #fff;
              font-weight: 700;
              letter-spacing: 0.6px;
              text-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }

            .sub-title {
              font-size: 0.9rem;
              color: #f6ebeb;
              margin-bottom: 25px; /* Increased for airy feel */
              font-weight: 400;
              letter-spacing: 0.3px;
            }

            .heading-image {
              width: 70px;
              height: auto;
              display: block;
              margin: 0 auto;
              object-fit: contain;
              padding: 15px 0; /* Increased padding */
            }

            .heading-image:hover {
              transform: scale(1.05);
              transition: 0.3s ease;
            }

            .input-field {
              position: relative;
              margin: 30px 0; /* Increased for better separation as requested */
            }

            .input-field input {
              width: 100%;
              height: 45px;
              background: rgba(255,255,255,0.08) !important;
              border: 1px solid rgba(255,255,255,0.25);
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
              -webkit-box-shadow: 0 0 0 1000px #34333b inset !important;
              -webkit-text-fill-color: #fff !important;
              transition: background-color 5000s ease-in-out 0s;
            }

            .input-field input:focus {
              border-color: #fff;
              background: rgba(255,255,255,0.15) !important;
            }

            .input-field label {
              position: absolute;
              top: 50%;
              left: 12px;
              transform: translateY(-50%);
              color: rgba(255,255,255,0.7);
              font-size: 15px;
              pointer-events: none;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              z-index: 5;
            }

            .input-field input:focus ~ label,
            .input-field input:not(:placeholder-shown) ~ label,
            .input-field input.has-value ~ label {
              font-size: 0.75rem;
              top: 0; /* Better alignment for floating */
              transform: translateY(-100%); /* Adjusted from translateY(-50%) to move above input */
              color: #fff;
            }

            .eye-icon {
              position: absolute;
              right: 12px;
              top: 50%;
              transform: translateY(-50%);
              cursor: pointer;
              font-size: 16px;
              color: rgba(255,255,255,0.6);
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

            #remember {
              accent-color: #fff;
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
              box-shadow: 0 3px 8px rgba(255,255,255,0.2);
              width: 100%;
            }

            button:hover {
              background: rgba(255,255,255,0.15);
              color: #fff;
              border: 1px solid #fff;
              box-shadow: 0 0 8px rgba(255,255,255,0.4);
            }

            .divider {
              display: flex;
              align-items: center;
              margin: 30px 0; /* Increased for airy feel */
              color: rgba(255,255,255,0.6);
            }

            .divider-line {
              flex: 1;
              height: 1px;
              background: rgba(255,255,255,0.2);
            }

            .divider-text {
              padding: 0 10px;
              font-size: 0.8rem;
            }

            .auth-switch {
              margin-top: 20px;
              text-align: center;
            }

            .auth-switch p {
              color: rgba(255,255,255,0.8);
              font-size: 0.9rem;
            }

            .auth-switch a {
              color: #fff;
              font-weight: 600;
              text-decoration: none;
            }

            .auth-switch a:hover {
              text-decoration: underline;
              color: #e0e0e0;
            }

            /* ─── Custom Google Button Styles ─────────────────────────── */
            .google-btn {
              width: 100%;
              background: #fff;
              color: #444;
              border-radius: 8px;
              padding: 10px 15px;
              font-weight: 600;
              display: flex;
              align-items: center;
              justify-content: space-between;
              cursor: pointer;
              transition: all 0.3s ease;
              font-size: 14px;
              text-decoration: none;
              margin-top: 5px;
            }

            .google-btn:hover {
              background: #f7f7f7;
            }

            .google-user {
              display: flex;
              align-items: center;
              gap: 12px;
              text-align: left;
            }

            .google-avatar {
              width: 34px;
              height: 34px;
              background: #5d4037;
              color: #fff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 15px;
            }

            .google-info {
              display: flex;
              flex-direction: column;
              line-height: 1.2;
            }

            .google-name {
              font-weight: 700;
              color: #3c4043;
              font-size: 13px;
            }

            .google-email {
              font-size: 11px;
              color: #70757a;
            }

            .google-icon {
              width: 20px;
              height: 20px;
            }

            /* ─── Media Queries ──────────────────────────────────────────────── */

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
              .wrapper {
                width: 95%;
                padding: 25px 20px;
                min-height: auto;
              }
              .heading-image { width: 50px; padding: 6px 0; }
              h2 { font-size: 1.2rem; margin-bottom: 6px; }
              .sub-title { font-size: 0.8rem; margin-bottom: 6px; }
              .input-field { margin: 12px 0; }
              .input-field input { height: 40px; font-size: 15px; padding: 0 35px 0 10px; }
              button { font-size: 14px; padding: 10px 16px; }
              .forget {
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 6px;
                margin: 15px 0 20px 0;
              }
              .auth-switch { margin-top: 12px; }
            }

            @media (max-width: 430px) {
              .wrapper {
                width: 95%;
                padding: 20px 15px;
                min-height: auto;
                margin: 0 auto;
              }
              .heading-image { width: 45px; padding: 4px 0; }
              h2 { font-size: 1.1rem; margin-bottom: 5px; }
              .sub-title { font-size: 0.75rem; margin-bottom: 5px; }
              .input-field { margin: 25px 0; }
              .input-field input { height: 38px; font-size: 14px; padding: 0 30px 0 10px; }
              button { font-size: 13px; padding: 9px 14px; }
              .forget {
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 5px;
                margin: 12px 0 18px 0;
              }
              .auth-switch { margin-top: 10px; }
            }
          `,
        }}
      />

      {!isRegistering ? (
        <div className="wrapper">
          <img src="/assets/images/Logo.PNG" alt="Heading Image" className="heading-image" />

          <h2>Solution Arena Ministry</h2>
          <p className="sub-title">Sign In To Site</p>

          <form onSubmit={handleLogin}>
            <div className="input-field">
              <input
                type="text"
                required
                autoComplete="off"
                placeholder=" "
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                }}
                className={loginEmail ? "has-value" : ""}
              />
              <label>Enter your email</label>
            </div>

            <div className="input-field">
              <input
                type={showLoginPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder=" "
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={loginPassword ? "has-value" : ""}
              />
              <label>Enter your password</label>
              <i
                className={`fa-solid ${showLoginPassword ? "fa-eye" : "fa-eye-slash"} eye-icon`}
                onClick={() => setShowLoginPassword(!showLoginPassword)}
              />
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

            <div className="google-btn" onClick={() => signIn("google", { callbackUrl: "/" })}>
              <div className="google-user">
                {!mounted ? (
                  <>
                    <div className="google-avatar">G</div>
                    <div className="google-info">
                      <span className="google-name">Sign in with Google</span>
                      <span className="google-email">Quick & Secure Access</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="google-avatar">
                      {(session?.user?.name || lastUsedName || "G").charAt(0).toUpperCase()}
                    </div>
                    <div className="google-info">
                      <span className="google-name">
                        {session?.user?.name || lastUsedName ? `Login as ${session?.user?.name || lastUsedName}` : "Sign in with Google"}
                      </span>
                      <span className="google-email">
                        {session?.user?.email || lastUsedEmail || "Quick & Secure Access"}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="google-icon" />
            </div>
          </form>

          <div className="auth-switch">
            <p>
              Don't have an account? <a href="#" onClick={toggleForm}>Register</a>
            </p>
          </div>
        </div>
      ) : (
        <div className="wrapper" id="registerWrapper">
          <img src="/assets/images/Logo.PNG" alt="Heading Image" className="heading-image" />

          <h2>Join Us</h2>
          <p className="sub-title">Sign up to get started</p>

          <div className="google-btn" style={{ marginTop: "20px", marginBottom: "30px" }} onClick={() => signIn("google", { callbackUrl: "/" })}>
            <div className="google-user">
              {!mounted ? (
                <>
                  <div className="google-avatar">G</div>
                  <div className="google-info">
                    <span className="google-name">Sign up with Google</span>
                    <span className="google-email">Quick & Secure Access</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="google-avatar">
                    {(session?.user?.name || lastUsedName || "G").charAt(0).toUpperCase()}
                  </div>
                  <div className="google-info">
                    <span className="google-name">
                      {session?.user?.name || lastUsedName ? `Login as ${session?.user?.name || lastUsedName}` : "Sign up with Google"}
                    </span>
                    <span className="google-email">
                      {session?.user?.email || lastUsedEmail || "Quick & Secure Access"}
                    </span>
                  </div>
                </>
              )}
            </div>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="google-icon" />
          </div>

          <div className="auth-switch">
            <p>
              Already have an account? <a href="#" onClick={toggleForm}>Log In</a>
            </p>
          </div>
        </div>
      )}

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
    </>
  );
};

const LoginPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LoginContent />
  </Suspense>
);

export default LoginPage;
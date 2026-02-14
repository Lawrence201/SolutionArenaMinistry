"use client";

import React from "react";

const Header = () => {
  return (
    <header className="header-one">
      <div className="top-bar">
        <div className="container">
          <div className="row">
            <div className="col-lg-9">
              <ul className="login">
                <li className="auth-links" id="auth-links-desktop">
                  <a href="/users_login/Users_login.html" id="login-link-desktop">
                    <img src="/assets/images/user-profile.svg" alt="User Profile" />
                    Login
                  </a>
                  <span className="divider" id="divider-desktop">|</span>
                  <a href="/users_login/Users_login.html?register=true" id="register-link-desktop">Register</a>
                </li>
                <li>
                  <a href="JavaScript:void(0)">
                    <img src="/assets/images/bell.svg" alt="Bell" className="vibrate-bell" />
                    Deadly commited to SAM and the kingdom business.
                  </a>
                </li>
              </ul>
              <style dangerouslySetInnerHTML={{
                __html: `
                #auth-links-mobile {
                  position: absolute;
                  bottom: 80px;
                  left: 15px;
                }
                @keyframes vibrate {
                  0% { transform: rotate(0deg); }
                  25% { transform: rotate(5deg); }
                  50% { transform: rotate(-5deg); }
                  75% { transform: rotate(5deg); }
                  100% { transform: rotate(0deg); }
                }
                .vibrate-bell {
                  animation: vibrate 0.5s infinite;
                  transform-origin: center;
                  display: inline-block;
                }
                ul.login li.auth-links a {
                  margin: 0 5px;
                  text-decoration: none;
                  color: whitesmoke;
                }
                ul.login li.auth-links a:hover {
                  color: #333;
                }
                ul.login li.auth-links .divider {
                  color: whitesmoke;
                  margin: 0 5px;
                }
                ul.login li.auth-links a.user-greeting {
                  font-weight: 700;
                  color: #ffffff !important;
                }
                ul.login li.auth-links a.user-greeting:hover {
                  color: #f2f2f2 !important;
                }
              `}} />
            </div>
            <div className="col-lg-2 offset-1">
              <ul className="social-medias">
                <li>
                  <a href="https://www.facebook.com/profile.php?id=100064869240415&mibextid=LQQJ4d"
                    target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <i className="fa-brands fa-facebook-f"></i>
                  </a>
                </li>
                <li>
                  <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer"
                    aria-label="YouTube">
                    <i className="fa-brands fa-youtube"></i>
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/solutionarenaministry?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                    target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <i className="fa-brands fa-instagram"></i>
                  </a>
                </li>
                <li>
                  <a href="https://www.tiktok.com/@sam_cityoftruth?is_from_webapp=1&sender_device=pc"
                    target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                    <i className="fa-brands fa-tiktok"></i>
                  </a>
                </li>
              </ul>
              <style dangerouslySetInnerHTML={{
                __html: `
                .social-medias {
                  list-style: none;
                  padding: 0;
                  display: flex;
                  gap: 15px;
                }
                .social-medias li a {
                  color: white;
                  font-size: 27px;
                  transition: color 0.3s ease;
                  display: inline-block;
                  transition: transform 0.3s ease;
                }
                .social-medias li a:hover {
                  transform: scale(1.3);
                }
                .social-medias li a i {
                  color: inherit;
                }
              `}} />
            </div>
          </div>
        </div>
      </div>

      <div className="desktop-nav" id="stickyHeader">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <nav>
                <div className="full-logo">
                  <div className="logo">
                    <a href="/">
                      <img src="/assets/images/head.PNG" alt="Logo" />
                    </a>
                  </div>
                  <div className="logo-text">
                    <h1>SOLUTION ARENA <br /> MINISTRY</h1>
                    <p>The City of truth</p>
                  </div>
                </div>

                <style dangerouslySetInnerHTML={{
                  __html: `
                  .logo img {
                    display: block;
                    max-width: 100px;
                    height: auto;
                  }
                  .full-logo {
                    display: flex;
                    align-items: center;
                  }
                  .logo-text {
                    text-align: center;
                    position: relative;
                    top: 10px;
                    left: -20px;
                  }
                  .logo-text h1 {
                    font-size: 16px;
                    font-weight: 900;
                    color: #1f4372;
                    margin: 0;
                    font-family: "Montserrat", sans-serif;
                  }
                  .logo-text p {
                    font-size: 13px;
                    font-weight: 500;
                    color: #ecb111;
                    font-family: "Cinzel", serif;
                  }
                  @media (max-width: 780px) {
                    .logo img { max-width: 110px; }
                    .logo-text h1 { font-size: 18px; }
                    .logo-text p { font-size: 13px; }
                    .logo-text { top: 5px; left: -15px; }
                  }
                  @media (max-width: 480px) {
                    .logo img { max-width: 120px; }
                    .full-logo {
                      flex-direction: row;
                      align-items: center;
                      justify-content: flex-start;
                      margin-left: 0;
                      padding-left: 0;
                    }
                    .logo-text {
                      text-align: left;
                      position: relative;
                      top: 10px;
                      left: -34px;
                    }
                    .logo-text h1 { font-size: 16px; }
                    .logo-text p {
                      font-size: 12px;
                      position: relative;
                      top: -5px;
                    }
                  }
                  @media (max-width: 420px) {
                    .logo img { max-width: 110px; }
                    .logo-text h1 { font-size: 15px; }
                    .logo-text p { font-size: 11px; top: -4px; }
                    .logo-text { left: -28px; top: 8px; }
                  }
                  @media (max-width: 360px) {
                    .logo img { max-width: 100px; }
                    .logo-text h1 { font-size: 14px; }
                    .logo-text p { font-size: 10px; top: -3px; }
                    .logo-text { left: -24px; top: 6px; }
                  }
                `}} />

                <div className="nav-bar">
                  <ul>
                    <li><a href="/">Home</a></li>
                    <li className="menu-item-has-children">
                      <a href="JavaScript:void(0)">Pages</a>
                      <ul className="sub-menu">
                        <li><a href="/about-us">About</a></li>
                        <li><a href="/groups.html">Groups</a></li>
                        <li><a href="/pastor-detail.html">Pastor Detail</a></li>
                      </ul>
                    </li>
                    <li className="menu-item-has-children"><a href="JavaScript:void(0)">Sermons</a>
                      <ul className="sub-menu">
                        <li><a href="/sermons.html">Our Sermons</a></li>
                      </ul>
                    </li>
                    <li className="menu-item-has-children"><a href="JavaScript:void(0)">Events</a>
                      <ul className="sub-menu">
                        <li><a href="/events.html">Our Events</a></li>
                        <li><a href="/gallery.html">Gallery</a></li>
                      </ul>
                    </li>
                    <li><a href="/contact-us.html">Contact</a></li>
                    <li className="menu-item-has-children"><a href="JavaScript:void(0)">Blog</a>
                      <ul className="sub-menu">
                        <li><a href="/blog.html">Our Blog</a></li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <style dangerouslySetInnerHTML={{
                  __html: `
                  .nav-bar ul li a {
                    font-size: 17px;
                    font-weight: 800;
                    text-decoration: none;
                    color: inherit;
                    transition: all 0.3s ease;
                  }
                  .nav-bar ul li a:hover {
                    color: #446492;
                    font-weight: 900;
                  }
                  
                  /* Dropdown behavior fix */
                  .nav-bar ul li.menu-item-has-children {
                    position: relative;
                  }
                  .nav-bar ul li.menu-item-has-children ul.sub-menu {
                    position: absolute;
                    left: 0;
                    top: 100%;
                    background: #fff;
                    min-width: 200px;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(20px);
                    transition: all 0.3s ease;
                    z-index: 100;
                    list-style: none;
                    padding: 10px 0;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                  }
                  .nav-bar ul li.menu-item-has-children:hover > ul.sub-menu {
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: translateY(0) !important;
                  }
                  .nav-bar ul li.menu-item-has-children > a {
                    position: relative;
                    padding-right: 25px !important;
                  }
                  .nav-bar ul li.menu-item-has-children > a::after {
                    content: "\f107";
                    font-family: "Font Awesome 6 Free";
                    font-weight: 900;
                    position: absolute;
                    right: 0;
                    top: 55%;
                    transform: translateY(-50%);
                    font-size: 14px;
                    color: inherit;
                  }
                `}} />

                <div className="donation">
                  <a href="JavaScript:void(0)" className="theme-btn" data-bs-toggle="modal"
                    data-bs-target="#staticBackdrop">Donate</a>
                </div>

                <div id="nav-icon4">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-nav" id="mobile-nav">
        <div className="res-log">
          <div className="sam-logo-container">
            <div className="sam-logo-img-wrapper">
              <img src="/assets/images/head.PNG" alt="Logo" />
            </div>
            <div className="sam-logo-text">
              <h1>SOLUTION ARENA <br /> MINISTRY</h1>
              <p>The City of truth</p>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            .sam-logo-img-wrapper img {
              display: block;
              max-width: 120px;
              height: auto;
            }
            .sam-logo-container {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
            }
            .sam-logo-text {
              text-align: center;
              position: relative;
              top: 10px;
            }
            .sam-logo-text h1 {
              font-size: 20px;
              font-weight: 900;
              color: #1f4372;
              margin: 0;
              font-family: "Montserrat", sans-serif;
            }
            .sam-logo-text p {
              font-size: 14px;
              font-weight: 500;
              color: #edb109;
              font-family: "Cinzel", serif;
            }
            @media (max-width: 780px) {
              .sam-logo-img-wrapper img { max-width: 110px; }
              .sam-logo-text h1 { font-size: 18px; }
              .sam-logo-text p { font-size: 13px; }
              .sam-logo-text { top: 5px; left: -15px; }
            }
            @media (max-width: 480px) {
              .sam-logo-img-wrapper img { max-width: 115px; height: auto; }
              .sam-logo-container {
                flex-direction: row;
                align-items: center;
                justify-content: flex-start;
                margin-left: 0;
                padding-left: 0;
              }
              .sam-logo-text {
                text-align: left;
                position: relative;
                top: 10px;
                left: 50px;
                margin-left: 18px;
              }
              .sam-logo-text h1 { font-size: 16px; }
              .sam-logo-text p {
                font-size: 12px;
                position: relative;
                top: -5px;
              }
            }
          `}} />
        </div>

        <ul>
          <li><a href="/">Home</a></li>
          <li className="menu-item-has-children"><a href="JavaScript:void(0)">Pages</a>
            <ul className="sub-menu">
              <li><a href="/about-us">About</a></li>
              <li><a href="/groups.html">Groups</a></li>
              <li><a href="/pastor-detail.html">Pastor Detail</a></li>
            </ul>
          </li>
          <li className="menu-item-has-children"><a href="JavaScript:void(0)">Sermons</a>
            <ul className="sub-menu">
              <li><a href="/sermons.html">Our Sermons</a></li>
            </ul>
          </li>
          <li className="menu-item-has-children"><a href="JavaScript:void(0)">Events</a>
            <ul className="sub-menu">
              <li><a href="/events.html">Our Events</a></li>
              <li><a href="/gallery.html">Gallery</a></li>
            </ul>
          </li>
          <li><a href="/contact-us.html">Contact</a></li>
          <li className="menu-item-has-children"><a href="JavaScript:void(0)">Blog</a>
            <ul className="sub-menu">
              <li><a href="/blog.html">Our Blog</a></li>
            </ul>
          </li>
        </ul>

        <li className="auth-buttons" id="auth-links-mobile">
          <a href="/users_login/Users_login.html" id="login-link-mobile">
            <img src="/assets/images/user-profile.svg" alt="User Profile" />
            Login
          </a>
          <span className="divider" id="divider-mobile">|</span>
          <a href="/users_login/Users_login.html?register=true" className="btn-auth register-btn"
            id="register-link-mobile">
            Register
          </a>
        </li>

        <style dangerouslySetInnerHTML={{
          __html: `
          .auth-buttons {
            font-size: 20px;
            color: #333;
            margin-top: -90px;
          }
          .auth-buttons a {
            color: #030303;
            text-decoration: none;
          }
          @media (max-width: 780px) {
            #auth-links-mobile {
              display: flex;
              flex-direction: row;
              align-items: center;
              gap: 10px;
              margin-top: 0;
              font-size: 16px;
            }
            #auth-links-mobile img[src*="user-profile.svg"] {
              width: 22px;
              height: auto;
              margin-right: 5px;
              filter: invert(50%) sepia(93%) saturate(1352%) hue-rotate(188deg) brightness(93%) contrast(95%);
            }
          }
        `}} />

        <a href="JavaScript:void(0)" id="res-cross"></a>
      </div>
    </header>
  );
};

export default Header;

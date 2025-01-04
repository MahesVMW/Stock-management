import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Home.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Snowfall from 'react-snowfall';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const animationContainerRef = useRef(null);
  const headingRef = useRef(null);
  const paragraphRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    // Animate the container of the Lottie animation
    tl.fromTo(
      animationContainerRef.current,
      { x: -200, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.5, ease: 'bounce.out' }
    );
    tl.fromTo(
      headingRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' },
      '-=0.5'
    );
    tl.fromTo(
      paragraphRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
      '-=0.5'
    );
    tl.fromTo(
      buttonRef.current,
      { scale: 0 },
      { scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
      '-=0.5'
    );
  }, []);
  
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/dashboard'); // Replace '/dashboard' with your actual Dashboard route path
  };


  return (
     <div style={{ height: '100vh', position: 'relative'}}>
        <Snowfall 
          color="#7DF9FF" // Customize snowflake color
          snowflakeCount={100} // Number of snowflakes
          style={{ zIndex: -1 }} // Ensures it stays in the background
        />
    <div className="container-fluid home-container py-5 mt-5">
      <div className="row align-items-center">
        <div className="col-lg-6 mb-4 mb-lg-0">
          {/* Wrap Lottie animation in a container */}
          <div ref={animationContainerRef}>
            <DotLottieReact
              src="https://lottie.host/49e8e742-38a0-4688-8edc-c62d39fad504/40sSzhPskL.lottie"
              loop
              autoplay
            />
          </div>
        </div>
        <div className="col-lg-6">
          <h1 ref={headingRef} className=" welcome mb-4">Welcome to Stock Management System</h1>
          <p ref={paragraphRef} className="mb-4">
            Manage your stock effortlessly. Track inventory levels, update product
            details, and monitor sales with ease. Keep your business running
            smoothly with real-time updates and insights into your stock
            movements.
          </p>
          <button ref={buttonRef} className="btn btn-primary" onClick={handleButtonClick}>Get Started</button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Home;

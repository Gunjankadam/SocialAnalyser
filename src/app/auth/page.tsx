'use client'
import React, { useState } from 'react';
import Link from 'next/link';

export default function Homepage() {
  const [isRegister, setIsRegister] = useState(true); // Toggle between Register and Login forms

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('https://your-image-url.com/your-image.jpg')",
      }}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Register / Login Card */}
      <div className="relative z-10 bg-white bg-opacity-80 p-8 rounded-md shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isRegister ? 'Register' : 'Login'}
        </h2>

        {isRegister ? (
          <RegisterForm />
        ) : (
          <LoginForm />
        )}

        {/* Toggle Between Register and Login */}
        <div className="text-center mt-4">
          <p>
            {isRegister ? (
              <>
                Already have an account?{' '}
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={() => setIsRegister(false)}
                >
                  Login here
                </span>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '} {/* Escaped apostrophe */}
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={() => setIsRegister(true)}
                >
                  Register here
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function RegisterForm() {
  const [otpSent, setOtpSent] = useState(false);

  return (
    <form className="space-y-4">
      <input
        type="text"
        placeholder="Username"
        className="px-4 py-2 border border-gray-300 rounded-md w-full"
      />
      <input
        type="email"
        placeholder="Email"
        className="px-4 py-2 border border-gray-300 rounded-md w-full"
      />
      {!otpSent ? (
        <button
          type="button"
          onClick={() => setOtpSent(true)} // Simulate OTP sending
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Send OTP
        </button>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            className="px-4 py-2 border border-gray-300 rounded-md w-full"
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-2 border border-gray-300 rounded-md w-full"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="px-4 py-2 border border-gray-300 rounded-md w-full"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md"
          >
            Register
          </button>
        </>
      )}
    </form>
  );
}

function LoginForm() {
  return (
    <form className="space-y-4">
      <input
        type="text"
        placeholder="Username or Email"
        className="px-4 py-2 border border-gray-300 rounded-md w-full"
      />
      <input
        type="password"
        placeholder="Password"
        className="px-4 py-2 border border-gray-300 rounded-md w-full"
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Login
      </button>
      <div className="text-center">
        <Link href="/auth/forgot-password">
          <a className="text-blue-500">Forgot Password?</a>
        </Link>
      </div>
    </form>
  );
}

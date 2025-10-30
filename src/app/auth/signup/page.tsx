'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagicCard } from "@/components/magicui/magic-card";
import { Home } from "lucide-react";
import Alert  from '@/components/Alerts'; // Import Alert component


export default function SignUp() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);
  const [error3, setError3] = useState<string | null>(null);
  const [error4, setError4] = useState<string | null>(null);
  const [error5, setError5] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning' | null>(null);



  const checkIfEmailExists = async (email: string) => {
  const res = await fetch('/pages/api/auth/check-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  return data.exists; // true or false
};


 const handleSendOTP = async () => {
  if (!email){ 
    setAlertType('info'); setError("Enter an email")
    return;}

  const exists = await checkIfEmailExists(email);
  if (exists) {
    setAlertType('error');
    setError1("Account already exists!");
    return; 
  }

  const res = await fetch("/pages/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (data.otp) {
    setOtp(data.otp);
    setOtpSent(true);
  }
};


  const handleVerifyOTP = () => {
    if (otpInput === otp) {
      setVerified(true);
    } else {
      setAlertType('error');
      setError2('Invalid OTP');
    }
  };
  
    
  

  const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!verified) return;

  if (password !== confirmPassword) {
    setAlertType('error');
    setError3("Passwords do not match");
    return;} 

  const res = await fetch("/pages/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (data.success) {
    localStorage.setItem('userEmail', email);
          if (email) {
        await fetch('https://mainpython-kpk3.onrender.com/save-api-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            youtube_api: '',
            reddit_client_id: '',
            reddit_secret: '',
            reddit_user_agent: ''
          }),
        });
      }
      setAlertType('success');  
    setError4("Registration successful! Redirecting to login page...");
    setTimeout(() => {
      router.push("/auth/signin");
    }, 2000);
  } else {
    setAlertType('error');
    setError5(data.error || "Registration failed");
  }
};


  
  return (
    
 <div className="relative w-full h-screen bg-cover bg-center bg-no-repeat">
      
      <div className="fixed top-4 left-4 z-50">
  
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-md hover:bg-white hover:text-black transition border-t border-gray-200"
        >
          <Home size={20} />
          <span className="text-sm font-medium">Home</span>
        </button>

      </div>

      {/* Align the alert just above the card */}
      <div className="absolute top-16 w-80 left-1/2 transform -translate-x-1/2 z-50">
        {error && alertType && (
          <Alert message={error} type={alertType} onClose={() => setError(null)} />
        )}
        {error1 && alertType && (
          <Alert message={error1} type={alertType} onClose={() => setError1(null)} />
        )}
        {/* Render alert if there's an error message */}
        {error2 && alertType && (
          <Alert message={error2} type={alertType} onClose={() => setError2(null)} />
        )}
        {/* Render alert if there's an error message */}
        {error3 && alertType && (
          <Alert message={error3} type={alertType} onClose={() => setError3(null)} />
        )}
        {error4 && alertType && (
          <Alert message={error4} type={alertType} onClose={() => setError4(null)} />
        )}
        {error5 && alertType && (
          <Alert message={error5} type={alertType} onClose={() => setError5(null)} />
        )}
      </div>

    <div className="flex items-center justify-center h-full">

      <MagicCard className="relative w-[350px] overflow-hidden p-6">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Start your journey with us today.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="grid w-full items-center gap-4">

              {/* Email Field */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email"></Label>
                <Input
                  id="email"
                  label="Email" 
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  disabled={verified}
                />
              </div>

              {/* Verify Button Below Email */}
              {!verified && (
               
                <p className="text-center" >
                          <InteractiveHoverButton type="submit" onClick={handleSendOTP}>
                            Verify
                 </InteractiveHoverButton>
                </p>
              )}

              {/* OTP Field */}
              {otpSent && !verified && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="otp"></Label>
                    <Input
                      id="otp"
                      label="Enter OTP"
                      type="text"
                      placeholder="4-digit OTP"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <p className="text-center" >
                            <InteractiveHoverButton type="submit" onClick={handleVerifyOTP}>
                              Submit OTP
                            </InteractiveHoverButton>
                  </p>
                </>
              )}

              {/* Password Fields */}
              {verified && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="password"></Label>
                    <Input
                      id="password"
                      label="Password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="confirmPassword"></Label>
                    <Input
                      id="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col justify-center items-center gap-4">
          {verified && (
            <p className="text-center" >
                      <InteractiveHoverButton type="submit" onClick={handleSignUp}>
                        Sign Up
                      </InteractiveHoverButton>
                      </p>
          )}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => router.push('/auth/signin')}
            >
              Login
            </span>
          </p>
        </CardFooter>
      </MagicCard>
      </div>
    </div>
  );
}




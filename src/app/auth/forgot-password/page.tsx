'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MagicCard } from '@/components/magicui/magic-card';
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
import { Home } from "lucide-react";
import Alert from '@/components/Alerts'; // Import Alert component

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpServer, setOtpServer] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);
  const [error3, setError3] = useState<string | null>(null);
  const [error4, setError4] = useState<string | null>(null);
  const [error5, setError5] = useState<string | null>(null);
  const [error6, setError6] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning' | null>(null);


  const handleSendOTP = async () => {
    if (!email) {
      setAlertType('info');
      setError("Enter an email");
      return;
    }

    const res = await fetch("/pages/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (data.otp) {
      setOtpServer(data.otp);
      setOtpSent(true);
    } else {
      setAlertType('error');
      setError1("Failed to send OTP");
    }
  };

  const handleVerifyOTP = () => {
    if (otpInput === otpServer) {
      setVerified(true);
    } else {
      setAlertType('error');
      setError2("Invalid OTP");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setAlertType('error');
      setError3("Passwords do not match");
      return;
    }

   try {
  const res = await fetch('/pages/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });

  const data = await res.json();
  if (res.ok) {
    setAlertType('success');
    setError4('Password reset successful!');
    router.push('/auth/signin');
  } else {
    setAlertType('error');
    setError5(data.error || 'Something went wrong');
  }
} catch (err) {
  setAlertType('error');
  setError6('Server error');
  console.error(err);
}
  };

  return (
    <div className="relative w-full h-screen bg-cover bg-center bg-no-repeat">
      {/* Home button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-md hover:bg-white hover:text-black transition border-t border-gray-200"
        >
          <Home size={16} />
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
        {error6 && alertType && (
          <Alert message={error6} type={alertType} onClose={() => setError6(null)} />
        )}
      </div>

      {/* Form container */}
      <div className="flex items-center justify-center h-full">
        <MagicCard className="relative w-[350px] overflow-hidden p-6">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>We&apos;ll send you an OTP to reset your password.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              {/* Email input */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  label="Email" // Added label prop here
                />
              </div>

              {/* Flow Control */}
              {!otpSent ? (
              <p className="text-center">
                <InteractiveHoverButton type="button" onClick={handleSendOTP}>
                  Send OTP
                </InteractiveHoverButton>
              </p>
              ) : !verified ? (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="4-digit OTP"
                      label="OTP" // Added label prop here
                    />
                  </div>
                  <p className="text-center">
                  <InteractiveHoverButton type="button" onClick={handleVerifyOTP}>
                    Verify OTP
                  </InteractiveHoverButton>
                  </p>
                </>
              ) : (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      label="New Password" // Added label prop here
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      label="Confirm Password" // Added label prop here
                    />
                  </div>
                  <p className="text-center">
                  <InteractiveHoverButton type="button" onClick={handleResetPassword}>
                    Reset Password
                  </InteractiveHoverButton>
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </MagicCard>
      </div>
    </div>
  );
}

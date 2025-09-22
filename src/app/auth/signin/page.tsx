'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagicCard } from "@/components/magicui/magic-card";  // Import MagicCard
import { Home } from "lucide-react";
import Alert from '@/components/Alerts'; // Import Alert component

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);
  const [error3, setError3] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning' | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setAlertType('info');
      setError('Please enter both email and password.');
      return;
    }

    try {
      const res = await fetch('/pages/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null); // 🔐 Safely handle empty JSON

      if (!res.ok) {
        setAlertType('error');
        setError1(data?.error || 'Login failed');
        return;
      }

      // If login successful
      localStorage.setItem('userEmail', email);
      setAlertType('success');
      setError2('Login successful! Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      setAlertType('error');
      setError3('Something went wrong during login. Please try again later.');
    }
  };

  return (
    <div className="relative w-full h-screen bg-cover bg-center bg-no-repeat">
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
      </div>

      <div className="flex items-center justify-center h-full">
        <MagicCard className="relative w-[350px] overflow-hidden p-6">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    label="Email"  // Added label prop
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    label="Password"  // Added label prop
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col justify-center items-center gap-4">
            <p className="text-center">
              <InteractiveHoverButton type="submit" onClick={handleSignIn}>
                Login
              </InteractiveHoverButton>
            </p>
            <p className="text-center text-sm text-gray-600">
              New User?{' '}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => router.push('/auth/signup')}
              >
                Register
              </span>
            </p>
            <p className="text-center text-sm text-gray-600">
              Forgot your password?{' '}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => router.push('/auth/forgot-password')}
              >
                Reset
              </span>
            </p>
          </CardFooter>
        </MagicCard>
      </div>
    </div>
  );
}

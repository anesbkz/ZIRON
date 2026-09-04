import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { GridPattern } from '@/components/design-system/GridPattern';
import { UserPlus, Shield, AlertCircle, Loader2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { navigate } = useI18n();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serialCode, setSerialCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (password.length < 6) {
      setErrorMessage('Passphrase must be at least 6 characters in length.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName);
      // Successfully registered into Firebase Auth and Firestore UserProfile
      navigate('app');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      if (msg.includes('auth/email-already-in-use')) {
        setErrorMessage('An account with this email address is already enrolled.');
      } else if (msg.includes('auth/weak-password')) {
        setErrorMessage('The supplied password is too weak. Please use stronger entropy.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-[#F5F7FA]">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E2E8F0] mb-3">
            <UserPlus className="w-3.5 h-3.5 text-[#0B2346]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0B2346]">
              SUBJECT ENROLLMENT GATEWAY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B2346] mb-2">
            Enroll in ZIRON Ecosystem
          </h1>
          <p className="text-xs text-gray-600">
            Initialize your 90-day trajectory profile and synchronize with Firebase Cloud.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 shadow-sm relative">
          <GridPattern />
          <div className="relative z-10">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Legal / Preferred Name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. / Mr. / Ms. Full Name"
              />

              <Input
                label="Electronic Mail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="subject@virexon-biosciences.com"
              />

              <Input
                label="Passphrase"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                helperText="Secured with Firebase Auth cryptographic hashing."
              />

              <Input
                label="Serialized Product Verification Code (Optional)"
                type="text"
                value={serialCode}
                onChange={(e) => setSerialCode(e.target.value.toUpperCase())}
                placeholder="ZR-XXXX-XXXX-XXXX"
                helperText="Printed on the reverse of your 30-capsule phase container."
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enrolling Subject Identity...
                  </span>
                ) : (
                  'Submit Enrollment'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <button
                onClick={() => navigate('login')}
                className="text-[#0B2346] font-semibold hover:underline cursor-pointer"
              >
                Already enrolled? Sign in →
              </button>
              <button
                onClick={() => navigate('verify')}
                className="text-gray-500 hover:text-[#0B2346] cursor-pointer"
              >
                Verify Code First
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

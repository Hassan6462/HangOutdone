import React, { useState } from 'react';
import { UserProfile } from '../types';
import { storage } from '../services/storage';
import {
  X,
  ArrowRight,
  ShieldCheck,
  Camera,
  Sparkles,
  Check,
  Lock,
  Mail,
  KeyRound,
  FileText,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

const INTERESTS_LIST = [
  '⚽ Sports', '🎬 Movies', '📺 TV Shows', '☕ Coffee',
  '🍕 Food', '✈️ Travel', '🎵 Music', '🎮 Gaming',
  '📚 Reading', '🏃 Fitness', '🎨 Art', '🧘 Wellness',
  '🌿 Outdoors', '🎭 Theatre', '🏖️ Beach', '🎤 Live Events',
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<
    'auth' | 'otp' | 'setup_name' | 'setup_photo' | 'setup_interests' | 'forgot_password'
  >('auth');

  // Auth fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Profile setup fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('2002-05-15');
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [calculatedAge, setCalculatedAge] = useState<number>(24);

  if (!isOpen) return null;

  const handleContinueAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const input = identifier.trim();
    if (!input) {
      alert('Please enter your phone number or email');
      return;
    }

    const isEmail = input.includes('@');
    if (isEmail) {
      if (!showPassword) {
        setShowPassword(true);
        return;
      }
      if (!password.trim()) {
        alert('Please enter your password');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep('setup_name');
      }, 400);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setOtpCode('123456'); // Pre-filled test code (FR-A3)
        setStep('otp');
      }, 400);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Instant Google Sign In simulation (FR-A4)
      const googleUser: UserProfile = {
        uid: `user_google_${Date.now()}`,
        firstName: 'Alex',
        lastName: 'Rider',
        fullName: 'Alex Rider',
        dobDay: 14,
        dobMonth: 6,
        dobYear: 2001,
        age: 25,
        photoUri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        interests: ['☕ Coffee', '⚽ Sports', '🎮 Gaming'],
        profileComplete: true,
        trustScore: 5.0,
        reviewCount: 2,
        createdAt: Date.now(),
        isVerified: true,
      };
      storage.saveUserProfile(googleUser);
      storage.setCurrentUser(googleUser);
      onLoginSuccess(googleUser);
      onClose();
    }, 500);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    alert(`Password reset instructions sent to ${resetEmail}. Check your inbox!`);
    setStep('auth');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      alert('Please enter the full 6-digit code');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('setup_name');
    }, 400);
  };

  const handleQuickDemoSelect = (userUid: string) => {
    const user = storage.getUser(userUid);
    if (user) {
      storage.setCurrentUser(user);
      onLoginSuccess(user);
      onClose();
    }
  };

  const handleStepNameNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      alert('Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      alert('Please enter your last name');
      return;
    }
    if (!dob) {
      alert('Please select your date of birth');
      return;
    }

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // FR-A10: Users under 15 are blocked at signup based on date of birth
    if (age < 15) {
      alert('You must be at least 15 years old to join HangOut.');
      return;
    }

    setCalculatedAge(age);
    setStep('setup_photo');
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleFinishProfile = () => {
    if (selectedInterests.length < 2) {
      alert('Please pick at least 2 interests');
      return;
    }

    const birthDate = new Date(dob);
    const uid = `user_${Date.now()}`;
    const newProfile: UserProfile = {
      uid,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      dobDay: birthDate.getDate(),
      dobMonth: birthDate.getMonth() + 1,
      dobYear: birthDate.getFullYear(),
      age: calculatedAge,
      photoUri: selectedPhoto || PRESET_AVATARS[0],
      interests: selectedInterests,
      profileComplete: true,
      trustScore: 5.0,
      reviewCount: 0,
      createdAt: Date.now(),
      showLastName: true,
      showAge: true,
    };

    storage.saveUserProfile(newProfile);
    storage.setCurrentUser(newProfile);
    onLoginSuccess(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden my-6 border border-white/20 animate-in fade-in zoom-in-95 duration-200">
        {/* Background gradient from SRS (coral to dusk purple) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF7E5F] via-[#FF6B6B] to-[#4A3F6B]" />

        <div className="relative z-10 p-6 sm:p-8 text-white flex flex-col min-h-[500px]">
          {/* Close button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP: AUTH */}
          {step === 'auth' && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="text-center my-2">
                <div className="w-20 h-20 mx-auto mb-2 flex items-center justify-center">
                  <img
                    src="/logo_hangout.png"
                    alt="HangOut"
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">HangOut</h2>
                <p className="text-xs text-[#E8E0FF] mt-1 font-medium">
                  Spontaneous meetups. Golden moments.
                </p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white border border-white/20">
                  Friendship & Activities Only
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleContinueAuth} className="space-y-3 my-3">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Email or phone number"
                  className="w-full h-12 px-4 rounded-2xl bg-white/15 border border-white/30 text-white placeholder-[#CCC3E8] focus:outline-none focus:ring-2 focus:ring-white/50 text-xs backdrop-blur-xs transition"
                />

                {showPassword && (
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full h-12 px-4 rounded-2xl bg-white/15 border border-white/30 text-white placeholder-[#CCC3E8] focus:outline-none focus:ring-2 focus:ring-white/50 text-xs backdrop-blur-xs transition"
                    />
                    <div className="text-right mt-1">
                      <button
                        type="button"
                        onClick={() => setStep('forgot_password')}
                        className="text-[11px] text-[#E8E0FF] hover:underline"
                      >
                        Forgot password? (FR-A6)
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-white text-[#2D2640] hover:bg-white/95 active:scale-[0.98] font-bold text-xs transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Continue with Phone / Email</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Google Sign In Button (FR-A4) */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full h-11 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs transition flex items-center justify-center space-x-2 mb-3"
              >
                <span>Continue with Google</span>
              </button>

              {/* Demo Profiles */}
              <div className="pt-2 border-t border-white/20">
                <p className="text-[10px] text-[#E8E0FF] text-center mb-1.5 font-medium">
                  Instant demo sign-in:
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoSelect('user_ahmed_1')}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-semibold text-center transition"
                  >
                    Ahmed ⚽
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoSelect('user_sara_2')}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-semibold text-center transition"
                  >
                    Sara ☕
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoSelect('user_liam_3')}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-semibold text-center transition"
                  >
                    Liam 🏸
                  </button>
                </div>
              </div>

              {/* Terms Link (FR-T2) */}
              <p className="text-[10px] text-[#B3A8D9] text-center mt-3">
                By signing up you accept our Community Safety Rules & Terms of Use (Age 15+).
              </p>
            </div>
          )}

          {/* STEP: FORGOT PASSWORD (FR-A6) */}
          {step === 'forgot_password' && (
            <div className="flex-1 flex flex-col justify-between py-2">
              <div>
                <KeyRound className="w-10 h-10 text-white mb-2" />
                <h3 className="text-xl font-bold">Reset Password</h3>
                <p className="text-xs text-[#E8E0FF] mt-1">
                  Enter your email address and we'll send you password reset instructions.
                </p>

                <form onSubmit={handleResetPassword} className="space-y-3 mt-5">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    className="w-full h-12 px-4 rounded-xl bg-white/15 border border-white/30 text-white placeholder-white/40 text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-white text-[#2D2640] font-bold text-xs shadow-md transition"
                  >
                    Send Reset Link
                  </button>
                </form>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setStep('auth')}
                    className="text-xs text-[#E8E0FF] underline"
                  >
                    Back to login
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: OTP */}
          {step === 'otp' && (
            <div className="flex-1 flex flex-col justify-between py-2">
              <div>
                <ShieldCheck className="w-10 h-10 text-white mb-2" />
                <h3 className="text-xl font-bold">Verify Your Number</h3>
                <p className="text-xs text-[#E8E0FF] mt-1">
                  Enter the 6-digit code sent to {identifier || 'your phone'}
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-4 mt-6">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full h-14 text-center tracking-[0.4em] text-2xl font-bold rounded-2xl bg-white/15 border border-white/30 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                  />
                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-white text-[#2D2640] font-bold text-xs shadow-lg transition"
                  >
                    Verify & Continue
                  </button>
                </form>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setStep('auth')}
                    className="text-xs text-[#E8E0FF] underline"
                  >
                    Use email instead
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: PROFILE SETUP - NAME & AGE (FR-A10: Age 15+ check) */}
          {step === 'setup_name' && (
            <div className="flex-1 flex flex-col justify-between py-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8E0FF]">
                  Step 1 of 3
                </span>
                <h3 className="text-xl font-bold mt-1">What's your name & age?</h3>
                <p className="text-xs text-[#E8E0FF] mt-0.5">
                  Users under 15 are blocked per safety requirements.
                </p>

                <form onSubmit={handleStepNameNext} className="space-y-3 mt-4">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1 text-[#E8E0FF]">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Alex"
                      required
                      className="w-full h-11 px-4 rounded-xl bg-white/15 border border-white/30 text-white placeholder-white/40 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1 text-[#E8E0FF]">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Miller"
                      required
                      className="w-full h-11 px-4 rounded-xl bg-white/15 border border-white/30 text-white placeholder-white/40 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1 text-[#E8E0FF]">
                      Date of Birth (Must be 15+)
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-white/15 border border-white/30 text-white text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-3 h-12 rounded-2xl bg-white text-[#2D2640] font-bold text-xs shadow-lg flex items-center justify-center space-x-2 transition"
                  >
                    <span>Next: Add Photo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* STEP: PROFILE SETUP - PHOTO */}
          {step === 'setup_photo' && (
            <div className="flex-1 flex flex-col justify-between py-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8E0FF]">
                  Step 2 of 3
                </span>
                <h3 className="text-xl font-bold mt-1">Profile Photo</h3>
                <p className="text-xs text-[#E8E0FF] mt-0.5">
                  Pick an avatar or paste an image link.
                </p>

                <div className="flex flex-col items-center my-4">
                  <div className="w-24 h-24 rounded-full ring-4 ring-white/30 overflow-hidden bg-white/10 flex items-center justify-center shadow-lg">
                    {selectedPhoto ? (
                      <img src={selectedPhoto} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-white/50" />
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-center space-x-2">
                    {PRESET_AVATARS.map((uri, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPhoto(uri)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition ${
                          selectedPhoto === uri ? 'border-white scale-110 shadow-md' : 'opacity-70'
                        }`}
                      >
                        <img src={uri} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setStep('setup_interests')}
                    className="w-full h-12 rounded-2xl bg-white text-[#2D2640] font-bold text-xs shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>Next: Pick Interests</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPhoto('');
                      setStep('setup_interests');
                    }}
                    className="w-full py-1.5 text-xs text-[#E8E0FF] underline text-center"
                  >
                    Skip photo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: PROFILE SETUP - INTERESTS (At least 2 required) */}
          {step === 'setup_interests' && (
            <div className="flex-1 flex flex-col justify-between py-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8E0FF]">
                  Step 3 of 3
                </span>
                <h3 className="text-xl font-bold mt-1">Pick your interests</h3>
                <p className="text-xs text-[#E8E0FF] mt-0.5">
                  Select at least 2 activities you want to hangout for.
                </p>

                <div className="grid grid-cols-2 gap-1.5 my-4 max-h-56 overflow-y-auto pr-1">
                  {INTERESTS_LIST.map((int) => {
                    const isSelected = selectedInterests.includes(int);
                    return (
                      <button
                        key={int}
                        type="button"
                        onClick={() => toggleInterest(int)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-left flex items-center justify-between border transition ${
                          isSelected
                            ? 'bg-white text-[#2D2640] border-white shadow-md'
                            : 'bg-white/10 text-white border-white/20'
                        }`}
                      >
                        <span className="truncate">{int}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-1 text-[#FF7E5F] shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleFinishProfile}
                  className="w-full h-12 rounded-2xl bg-white text-[#2D2640] font-bold text-xs shadow-lg flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#FF7E5F]" />
                  <span>Start Hanging Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

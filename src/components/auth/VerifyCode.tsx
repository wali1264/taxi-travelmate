
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Shield } from 'lucide-react';

interface VerifyCodeProps {
  phoneNumber: string;
  onBack: () => void;
  onSuccess: () => void;
}

const VerifyCode: React.FC<VerifyCodeProps> = ({ phoneNumber, onBack, onSuccess }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { verifyCode } = useAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle input change
  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, idx) => {
        if (idx + index < 6) {
          newCode[idx + index] = char;
        }
      });
      setCode(newCode);
      
      // Focus appropriate field after paste
      const focusIndex = Math.min(index + pastedCode.length, 5);
      setTimeout(() => {
        inputRefs.current[focusIndex]?.focus();
      }, 0);
      return;
    }

    // Handle normal input
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next field
    if (value && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
  };

  // Handle key press
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous field on backspace if current field is empty
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 0);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Submit verification code
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      toast.error('Please enter the complete verification code');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await verifyCode(phoneNumber, verificationCode);
      if (success) {
        toast.success('Verification successful!');
        onSuccess();
      } else {
        toast.error('Invalid verification code, please try again');
      }
    } catch (error) {
      toast.error('An error occurred, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend code
  const handleResend = async () => {
    try {
      await useAuth().sendVerificationCode(phoneNumber);
      toast.success('Verification code resent!');
    } catch {
      toast.error('Failed to resend verification code');
    }
  };

  return (
    <div className="w-full max-w-md px-4 py-8 mx-auto">
      <div className="text-center mb-10 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Verification Code</h1>
        <p className="text-muted-foreground">Enter the code sent to {phoneNumber}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
        <div className="flex justify-center gap-2">
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg bg-background border-border"
              disabled={isSubmitting}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <div className="flex gap-4 mt-6">
          <Button 
            type="button" 
            variant="outline"
            className="flex-1 h-12 text-base flex items-center justify-center gap-2 tap-effect"
            onClick={onBack}
            disabled={isSubmitting}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button 
            type="submit" 
            className="flex-1 h-12 text-base flex items-center justify-center gap-2 tap-effect"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Verify'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleResend}
            className="text-primary text-sm hover:underline focus:outline-none"
            disabled={isSubmitting}
          >
            Didn't receive a code? Resend
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerifyCode;

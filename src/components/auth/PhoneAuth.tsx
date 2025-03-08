
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ChevronRight, Smartphone } from 'lucide-react';

interface PhoneAuthProps {
  onCodeSent?: (phoneNumber: string) => void;
}

const PhoneAuth: React.FC<PhoneAuthProps> = ({ onCodeSent }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendVerificationCode } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const result = await sendVerificationCode(formattedPhone);
      
      if (result.success) {
        toast.success('Verification code sent!');
        if (onCodeSent) onCodeSent(formattedPhone);
      } else {
        toast.error(result.message || 'Failed to send verification code');
      }
    } catch (error) {
      toast.error('An error occurred, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4 py-8 mx-auto">
      <div className="text-center mb-10 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Welcome</h1>
        <p className="text-muted-foreground">Enter your phone number to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="h-12 pl-4 pr-12 text-base bg-background border-border"
              required
              disabled={isSubmitting}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We'll send a verification code to this number
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-base flex items-center justify-center gap-2 tap-effect"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending code...' : 'Continue'}
          <ChevronRight className="h-4 w-4" />
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </div>
  );
};

export default PhoneAuth;

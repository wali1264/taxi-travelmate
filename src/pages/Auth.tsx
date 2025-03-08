
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneAuth from '../components/auth/PhoneAuth';
import VerifyCode from '../components/auth/VerifyCode';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Redirect if user is already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleCodeSent = (phone: string) => {
    setPhoneNumber(phone);
    setActiveTab('verify');
  };

  const handleBack = () => {
    setActiveTab('login');
  };

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">RideShare</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="verify">Verify</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <PhoneAuth onCodeSent={handleCodeSent} />
            </TabsContent>
            <TabsContent value="verify">
              <VerifyCode 
                phoneNumber={phoneNumber} 
                onBack={handleBack} 
                onSuccess={handleSuccess} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

import { useState } from 'react';
import { useStartPhoneVerification, useConfirmPhoneVerification } from '../../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Phone } from 'lucide-react';

interface PhoneVerificationSectionProps {
  phoneNumber?: string;
  isPhoneVerified: boolean;
}

export default function PhoneVerificationSection({ phoneNumber, isPhoneVerified }: PhoneVerificationSectionProps) {
  const [phone, setPhone] = useState(phoneNumber || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const startVerification = useStartPhoneVerification();
  const confirmVerification = useConfirmPhoneVerification();

  const handleSendCode = async () => {
    setError('');
    setSuccess('');

    if (!phone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    try {
      const code = await startVerification.mutateAsync(phone.trim());
      setCodeSent(true);
      setSuccess(`Verification code sent! For testing, use code: ${code}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    }
  };

  const handleVerify = async () => {
    setError('');
    setSuccess('');

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      await confirmVerification.mutateAsync({
        phoneNumber: phone.trim(),
        verificationCode: verificationCode.trim(),
      });
      setSuccess('Phone number verified successfully!');
      setCodeSent(false);
      setVerificationCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to verify phone number');
    }
  };

  const getStatusBadge = () => {
    if (isPhoneVerified) {
      return (
        <Badge variant="default" className="bg-success text-success-foreground">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    if (phoneNumber && !isPhoneVerified) {
      return (
        <Badge variant="secondary">
          <Phone className="h-3 w-3 mr-1" />
          Pending verification
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Phone className="h-3 w-3 mr-1" />
        Not set
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Phone Number</Label>
        {getStatusBadge()}
      </div>

      {!isPhoneVerified && (
        <>
          <div className="space-y-2">
            <Input
              type="tel"
              placeholder="+1 234 567 8900"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={startVerification.isPending || confirmVerification.isPending || codeSent}
            />
            {!codeSent && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSendCode}
                disabled={startVerification.isPending || !phone.trim()}
                className="w-full"
              >
                {startVerification.isPending ? 'Sending...' : 'Send Verification Code'}
              </Button>
            )}
          </div>

          {codeSent && (
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Enter code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={confirmVerification.isPending}
              />
              <div className="flex space-x-2">
                <Button
                  type="button"
                  onClick={handleVerify}
                  disabled={confirmVerification.isPending || !verificationCode.trim()}
                  className="flex-1"
                >
                  {confirmVerification.isPending ? 'Verifying...' : 'Verify'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCodeSent(false);
                    setVerificationCode('');
                    setError('');
                    setSuccess('');
                  }}
                  disabled={confirmVerification.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {isPhoneVerified && phoneNumber && (
        <div className="text-sm text-muted-foreground">
          Your phone number {phoneNumber} is verified.
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

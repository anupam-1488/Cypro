// features/profile/components/PopupTab.tsx
import React, { useState, useCallback } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Label } from '@voilajsx/uikit/label';
import { Badge } from '@voilajsx/uikit/badge';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@voilajsx/uikit/dialog';
import { 
  User, 
  LogIn,
  LogOut,
  UserPlus,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  Shield,
  Key,
} from 'lucide-react';
import { useAuth } from '../../shared/hooks/useAuth';

// Constants
const FEEDBACK_DURATION = {
  DEFAULT: 3000,
  SUCCESS: 2000,
} as const;

const PASSWORD_MIN_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface PopupTabProps {
  value: string;
}

interface AuthForm {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
}

export default function PopupTab({ value }: PopupTabProps) {
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    loading,
    userName,
    userEmail,
    isEmailVerified,
    signIn,
    signUp,
    signOut,
    resetPassword,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [authForm, setAuthForm] = useState<AuthForm>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================

  const showFeedback = useCallback((type: 'success' | 'error' | 'info', message: string, duration = FEEDBACK_DURATION.DEFAULT) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), duration);
  }, []);

  const showSuccess = useCallback((message: string) => showFeedback('success', message, FEEDBACK_DURATION.SUCCESS), [showFeedback]);
  const showError = useCallback((message: string) => showFeedback('error', message), [showFeedback]);
  const showInfo = useCallback((message: string) => showFeedback('info', message), [showFeedback]);

  const validateEmail = (email: string): boolean => EMAIL_PATTERN.test(email);
  
  const validatePassword = (password: string): boolean => password.length >= PASSWORD_MIN_LENGTH;

  const updateFormField = useCallback((field: keyof AuthForm, value: string) => {
    setAuthForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setAuthForm({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    });
  }, []);

  // ===============================
  // AUTH OPERATIONS
  // ===============================

  const handleSignIn = useCallback(async () => {
    if (!validateEmail(authForm.email)) {
      showError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(authForm.password)) {
      showError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return;
    }

    const result = await signIn(authForm.email, authForm.password);
    
    if (result.success) {
      showSuccess('Welcome back!');
      resetForm();
    } else {
      showError(result.error || 'Sign in failed');
    }
  }, [authForm, signIn, showError, showSuccess, resetForm]);

  const handleSignUp = useCallback(async () => {
    if (!validateEmail(authForm.email)) {
      showError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(authForm.password)) {
      showError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return;
    }

    if (authForm.password !== authForm.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (!authForm.fullName?.trim()) {
      showError('Please enter your full name');
      return;
    }

    const metadata = {
      full_name: authForm.fullName.trim()
    };

    const result = await signUp(authForm.email, authForm.password, metadata);
    
    if (result.success) {
      showSuccess(result.error || 'Account created successfully!');
      resetForm();
      setAuthMode('signin');
    } else {
      showError(result.error || 'Sign up failed');
    }
  }, [authForm, signUp, showError, showSuccess, resetForm]);

  const handleSignOut = useCallback(async () => {
    const result = await signOut();
    
    if (result.success) {
      showSuccess('Signed out successfully!');
      resetForm();
    } else {
      showError(result.error || 'Sign out failed');
    }
  }, [signOut, showError, showSuccess, resetForm]);

  const handleResetPassword = useCallback(async () => {
    if (!validateEmail(resetEmail)) {
      showError('Please enter a valid email address');
      return;
    }

    const result = await resetPassword(resetEmail);
    
    if (result.success) {
      showSuccess('Password reset email sent!');
      setShowResetDialog(false);
      setResetEmail('');
    } else {
      showError(result.error || 'Failed to send reset email');
    }
  }, [resetEmail, resetPassword, showError, showSuccess]);

  // ===============================
  // RENDER HELPERS
  // ===============================

  const renderAuthenticatedView = () => (
    <div className="space-y-4">
      {/* User Info */}
      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-green-900">
              {userName || 'User'}
            </div>
            <div className="text-sm text-green-700">
              {userEmail}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isEmailVerified ? (
              <Badge variant="outline" className="text-green-700 border-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-orange-700 border-orange-300">
                <AlertCircle className="w-3 h-3 mr-1" />
                Unverified
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Profile Status */}
      {profile && (
        <div className="p-2 bg-blue-50 rounded border border-blue-200">
          <div className="text-sm text-blue-800">
            Profile completed • {profile.company && 'Company info available'}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {/* Navigate to options panel */}}
        >
          <Settings className="w-4 h-4 mr-2" />
          Manage Profile
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full text-red-600 hover:text-red-700"
          onClick={handleSignOut}
          disabled={loading.signOut}
        >
          {loading.signOut ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4 mr-2" />
          )}
          Sign Out
        </Button>
      </div>
    </div>
  );

  const renderSignInForm = () => (
    <div className="space-y-3">
      <div>
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="Enter your email"
          value={authForm.email}
          onChange={(e) => updateFormField('email', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
        />
      </div>
      
      <div>
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="Enter your password"
          value={authForm.password}
          onChange={(e) => updateFormField('password', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
        />
      </div>

      <Button
        onClick={handleSignIn}
        disabled={loading.signIn}
        className="w-full"
      >
        {loading.signIn ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <LogIn className="w-4 h-4 mr-2" />
        )}
        Sign In
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => setAuthMode('signup')}
        >
          Create account
        </button>
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => setShowResetDialog(true)}
        >
          Forgot password?
        </button>
      </div>
    </div>
  );

  const renderSignUpForm = () => (
    <div className="space-y-3">
      <div>
        <Label htmlFor="signup-name">Full Name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Enter your full name"
          value={authForm.fullName || ''}
          onChange={(e) => updateFormField('fullName', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
          value={authForm.email}
          onChange={(e) => updateFormField('email', e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder={`Enter password (min ${PASSWORD_MIN_LENGTH} chars)`}
          value={authForm.password}
          onChange={(e) => updateFormField('password', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="signup-confirm">Confirm Password</Label>
        <Input
          id="signup-confirm"
          type="password"
          placeholder="Confirm your password"
          value={authForm.confirmPassword || ''}
          onChange={(e) => updateFormField('confirmPassword', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
        />
      </div>

      <Button
        onClick={handleSignUp}
        disabled={loading.signUp}
        className="w-full"
      >
        {loading.signUp ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <UserPlus className="w-4 h-4 mr-2" />
        )}
        Create Account
      </Button>

      <div className="text-center">
        <button
          type="button"
          className="text-sm text-primary hover:underline"
          onClick={() => setAuthMode('signin')}
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );

  const renderPasswordResetDialog = () => (
    <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Reset Password
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reset-email">Email Address</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleResetPassword}
              disabled={loading.resetPassword}
              className="flex-1"
            >
              {loading.resetPassword ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Send Reset Email
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowResetDialog(false);
                setResetEmail('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ===============================
  // MAIN RENDER
  // ===============================

  // Enhanced loading state with timeout
  if (isLoading && !user) {
    return (
      <TabsContent value={value} className="mt-0">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2 mb-2" />
            <span>Loading profile...</span>
            <div className="text-xs text-muted-foreground mt-2">
              Taking too long? Try refreshing the extension
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  return (
    <TabsContent value={value} className="mt-0">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-4 h-4" />
            {isAuthenticated ? 'My Profile' : 'Authentication'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Main Content */}
          {isAuthenticated ? renderAuthenticatedView() : (
            authMode === 'signin' ? renderSignInForm() : renderSignUpForm()
          )}

          {/* Feedback */}
          {feedback && (
            <Alert variant={feedback.type === 'success' ? 'default' : feedback.type === 'error' ? 'destructive' : 'default'} className="py-2">
              {feedback.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : feedback.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              <AlertDescription className="text-sm">{feedback.message}</AlertDescription>
            </Alert>
          )}

          {/* Getting started info for new users */}
          {!isAuthenticated && (
            <div className="text-center text-xs text-muted-foreground bg-blue-50 rounded p-3">
              <div className="mb-2">
                {authMode === 'signin' ? 'Welcome back!' : 'Join our platform!'}
              </div>
              <div>
                {authMode === 'signin' 
                  ? 'Sign in to access your customer data and templates' 
                  : 'Create an account to save your data across devices'}
              </div>
            </div>
          )}

          {/* Password Reset Dialog */}
          {renderPasswordResetDialog()}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
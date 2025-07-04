// features/profile/components/OptionsPanel.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Label } from '@voilajsx/uikit/label';
import { Badge } from '@voilajsx/uikit/badge';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voilajsx/uikit/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@voilajsx/uikit/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@voilajsx/uikit/collapsible';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Shield,
  FileText,
  Save,
  Edit,
  Key,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  Camera,
  Trash2,
  RefreshCw,
  Clock,
  Timer,
  Info,
  UserCheck,
  Award,
} from 'lucide-react';
import { useAuth } from '../../shared/hooks/useAuth';

// Constants
const FEEDBACK_DURATION = 2000;
const PASSWORD_MIN_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\d\s\+\-\(\)]+$/;

// Role and Level options
const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrator' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'user', label: 'User' },
  { value: 'viewer', label: 'Viewer' },
];

const LEVEL_OPTIONS = [
  { value: 'review', label: 'Review' },
  { value: 'approve', label: 'Approve' },
  { value: 'execute', label: 'Execute' },
  { value: 'monitor', label: 'Monitor' },
];

interface ProfileForm {
  email: string;
  phone: string;
  role: string;
  level: string;
  full_name: string;
  department: string;
  job_title: string;
}

interface SecurityForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function OptionsPanel(): JSX.Element {
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    loading,
    userName,
    userEmail,
    userAvatar,
    isEmailVerified,
    sessionInfo,
    isSessionExpiringSoon,
    sessionDaysRemaining,
    updateProfile,
    updateUser,
    signOut,
    refreshSession,
    trackUserActivity,
  } = useAuth();

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    email: '',
    phone: '',
    role: '',
    level: '',
    full_name: '',
    department: '',
    job_title: '',
  });

  const [securityForm, setSecurityForm] = useState<SecurityForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================

  const showFeedback = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), FEEDBACK_DURATION);
  }, []);

  const showSuccess = useCallback((message: string) => showFeedback('success', message), [showFeedback]);
  const showError = useCallback((message: string) => showFeedback('error', message), [showFeedback]);
  const showInfo = useCallback((message: string) => showFeedback('info', message), [showFeedback]);

  const validateEmail = (email: string): boolean => EMAIL_PATTERN.test(email);
  const validatePhone = (phone: string): boolean => PHONE_PATTERN.test(phone);
  const validatePassword = (password: string): boolean => password.length >= PASSWORD_MIN_LENGTH;

  const updateProfileField = useCallback((field: keyof ProfileForm, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateSecurityField = useCallback((field: keyof SecurityForm, value: string) => {
    setSecurityForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetSecurityForm = useCallback(() => {
    setSecurityForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }, []);

  // ===============================
  // LOAD PROFILE DATA
  // ===============================

  useEffect(() => {
    if (profile) {
      setProfileForm({
        email: profile.email || '',
        phone: profile.phone || '',
        role: profile.role || '',
        level: profile.level || '',
        full_name: profile.full_name || '',
        department: profile.department || '',
        job_title: profile.job_title || '',
      });
    } else if (user) {
      // Initialize from user data if profile is not available
      setProfileForm({
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        level: user.level || '',
        full_name: user.user_metadata?.full_name || user.full_name || '',
        department: user.department || '',
        job_title: user.job_title || '',
      });
    }
  }, [profile, user]);

  // ===============================
  // PROFILE OPERATIONS
  // ===============================

  const handleUpdateProfile = useCallback(async () => {
    // Validation
    if (!profileForm.full_name.trim()) {
      showError('Full name is required');
      return;
    }

    if (!profileForm.email.trim()) {
      showError('Email is required');
      return;
    }

    if (!validateEmail(profileForm.email)) {
      showError('Please enter a valid email address');
      return;
    }

    if (profileForm.phone && !validatePhone(profileForm.phone)) {
      showError('Please enter a valid phone number');
      return;
    }

    if (!profileForm.role) {
      showError('Role is required');
      return;
    }

    if (!profileForm.level) {
      showError('Level is required');
      return;
    }

    if (!profileForm.department.trim()) {
      showError('Department is required');
      return;
    }

    if (!profileForm.job_title.trim()) {
      showError('Job title is required');
      return;
    }

    const result = await updateProfile(profileForm);
    
    if (result.success) {
      showSuccess('Profile updated successfully!');
      setIsEditing(false);
    } else {
      showError(result.error || 'Failed to update profile');
    }
  }, [profileForm, updateProfile, showError, showSuccess]);

  const handleUpdateSecurity = useCallback(async () => {
    // Validate password update
    if (!securityForm.newPassword) {
      showError('New password is required');
      return;
    }

    if (!validatePassword(securityForm.newPassword)) {
      showError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    const updates = {
      password: securityForm.newPassword,
    };

    const result = await updateUser(updates);
    
    if (result.success) {
      showSuccess('Password updated successfully!');
      setShowSecurityDialog(false);
      resetSecurityForm();
    } else {
      showError(result.error || 'Failed to update password');
    }
  }, [securityForm, updateUser, showError, showSuccess, resetSecurityForm]);

  const handleSignOut = useCallback(async () => {
    if (!confirm('Are you sure you want to sign out?')) return;

    const result = await signOut();
    
    if (result.success) {
      showSuccess('Signed out successfully!');
    } else {
      showError(result.error || 'Failed to sign out');
    }
  }, [signOut, showError, showSuccess]);

  const handleRefreshSession = useCallback(async () => {
    const result = await refreshSession();
    
    if (result.success) {
      showSuccess('Session refreshed successfully!');
    } else {
      showError(result.error || 'Failed to refresh session');
    }
  }, [refreshSession, showError, showSuccess]);

  // ===============================
  // RENDER HELPERS
  // ===============================

  const renderNotAuthenticatedView = () => (
    <div className="text-center py-8">
      <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
      <p className="text-muted-foreground mb-4">
        Please sign in to manage your profile settings
      </p>
      <Button variant="outline">
        <User className="w-4 h-4 mr-2" />
        Go to Authentication
      </Button>
    </div>
  );

  const renderSessionStatusCard = () => (
    <Card className={`mb-4 ${isSessionExpiringSoon ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4" />
            Session Status
          </CardTitle>
          <Button
            onClick={handleRefreshSession}
            disabled={loading.updateProfile}
            size="sm"
            variant="outline"
          >
            {loading.updateProfile ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3 mr-1" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Session Age:</span>
            <span className="text-sm font-medium">{sessionInfo.ageInDays} days</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Days Remaining:</span>
            <span className={`text-sm font-medium ${isSessionExpiringSoon ? 'text-orange-600' : 'text-green-600'}`}>
              {sessionDaysRemaining} days
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={isSessionExpiringSoon ? "destructive" : "default"}>
              {isSessionExpiringSoon ? 'Expiring Soon' : 'Active'}
            </Badge>
          </div>
          
          {isSessionExpiringSoon && (
            <Alert className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Your session will expire in {sessionDaysRemaining} day{sessionDaysRemaining !== 1 ? 's' : ''}. 
                Click Refresh to extend your session.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderProfileSection = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                onClick={() => {
                  setIsEditing(true);
                  trackUserActivity(); // Track activity when editing starts
                }}
                size="sm"
                variant="outline"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleUpdateProfile}
                  disabled={loading.updateProfile}
                  size="sm"
                >
                  {loading.updateProfile ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  Save
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  size="sm"
                  variant="outline"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* User Status */}
        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            {userAvatar ? (
              <img src={userAvatar} alt="Avatar" className="w-16 h-16 rounded-full" />
            ) : (
              <User className="w-8 h-8 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-medium">{profileForm.full_name || 'User'}</div>
            <div className="text-sm text-muted-foreground">{profileForm.email}</div>
            <div className="flex items-center gap-2 mt-1">
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
              <Badge variant="secondary" className="text-xs">
                {profileForm.role ? profileForm.role.charAt(0).toUpperCase() + profileForm.role.slice(1) : 'User'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {profileForm.level ? profileForm.level.charAt(0).toUpperCase() + profileForm.level.slice(1) : 'Basic'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-2 gap-4">
          {/* Personal Information */}
          <div className="col-span-2">
            <Label htmlFor="full-name">Full Name *</Label>
            <Input
              id="full-name"
              placeholder="Enter your full name"
              value={profileForm.full_name}
              onChange={(e) => updateProfileField('full_name', e.target.value)}
              disabled={!isEditing}
              className="flex items-center"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              {/* <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /> */}
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={profileForm.email}
                onChange={(e) => updateProfileField('email', e.target.value)}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              {/* <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /> */}
              <Input
                id="phone"
                placeholder="Enter your phone number"
                value={profileForm.phone}
                onChange={(e) => updateProfileField('phone', e.target.value)}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Role and Level */}
          <div>
            <Label htmlFor="role">Role *</Label>
            <Select
              value={profileForm.role}
              onValueChange={(value) => updateProfileField('role', value)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                {/* <UserCheck className="w-4 h-4 text-muted-foreground mr-2" /> */}
                <SelectValue placeholder="Select role">
                  {profileForm.role ? 
                    ROLE_OPTIONS.find(option => option.value === profileForm.role)?.label || profileForm.role
                    : "Select role"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="level">Level *</Label>
            <Select
              value={profileForm.level}
              onValueChange={(value) => updateProfileField('level', value)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                {/* <Award className="w-4 h-4 text-muted-foreground mr-2" /> */}
                <SelectValue placeholder="Select level">
                  {profileForm.level ? 
                    LEVEL_OPTIONS.find(option => option.value === profileForm.level)?.label || profileForm.level
                    : "Select level"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Work Information */}
          <div>
            <Label htmlFor="department">Department *</Label>
            <div className="relative">
              {/* <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /> */}
              <Input
                id="department"
                placeholder="Enter your department"
                value={profileForm.department}
                onChange={(e) => updateProfileField('department', e.target.value)}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="job-title">Job Title *</Label>
            <div className="relative">
              {/* <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /> */}
              <Input
                id="job-title"
                placeholder="Enter your job title"
                value={profileForm.job_title}
                onChange={(e) => updateProfileField('job_title', e.target.value)}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSecuritySection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5" />
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Current Security Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Email Address</div>
              <div className="text-sm text-muted-foreground">{profileForm.email}</div>
            </div>
            <Badge variant={isEmailVerified ? "default" : "destructive"}>
              {isEmailVerified ? "Verified" : "Unverified"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Password</div>
              <div className="text-sm text-muted-foreground">Last updated recently</div>
            </div>
            <Badge variant="outline">Protected</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Session</div>
              <div className="text-sm text-muted-foreground">
                Active for {sessionInfo.ageInDays} days • {sessionDaysRemaining} days remaining
              </div>
            </div>
            <Badge variant={isSessionExpiringSoon ? "destructive" : "default"}>
              {isSessionExpiringSoon ? "Expiring" : "Active"}
            </Badge>
          </div>
        </div>

        {/* Security Actions */}
        <div className="space-y-2">
          <Dialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                    value={securityForm.currentPassword}
                    onChange={(e) => updateSecurityField('currentPassword', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder={`Min ${PASSWORD_MIN_LENGTH} characters`}
                    value={securityForm.newPassword}
                    onChange={(e) => updateSecurityField('newPassword', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={securityForm.confirmPassword}
                    onChange={(e) => updateSecurityField('confirmPassword', e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleUpdateSecurity}
                    disabled={loading.updateProfile}
                    className="flex-1"
                  >
                    {loading.updateProfile ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Update Password
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSecurityDialog(false);
                      resetSecurityForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            variant="outline"
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
      </CardContent>
    </Card>
  );

  const renderStatsSection = () => (
    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between text-sm">
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Account Statistics
          </span>
          {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <div>• Account created: {new Date(user?.created_at || '').toLocaleDateString()}</div>
              <div>• Last updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}</div>
              <div>• Email verified: {isEmailVerified ? 'Yes' : 'No'}</div>
              <div>• Role: {profileForm.role ? profileForm.role.charAt(0).toUpperCase() + profileForm.role.slice(1) : 'Not set'}</div>
              <div>• Level: {profileForm.level ? profileForm.level.charAt(0).toUpperCase() + profileForm.level.slice(1) : 'Not set'}</div>
              <div>• Department: {profileForm.department || 'Not set'}</div>
              <div>• Job Title: {profileForm.job_title || 'Not set'}</div>
              <div>• Phone: {profileForm.phone || 'Not set'}</div>
              <div>• Session age: {sessionInfo.ageInDays} days</div>
              <div>• Session valid: {sessionInfo.isValid ? 'Yes' : 'No'}</div>
              <div>• Auto-refresh: Enabled</div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );

  // ===============================
  // MAIN RENDER
  // ===============================

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 p-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 p-4">
        <Card>
          <CardContent>
            {renderNotAuthenticatedView()}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account information and security settings
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'}>
          {feedback.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : feedback.type === 'info' ? (
            <Info className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* Session Status */}
      {renderSessionStatusCard()}

      {/* Main Sections */}
      {renderProfileSection()}
      {renderSecuritySection()}
      {renderStatsSection()}
    </div>
  );
}
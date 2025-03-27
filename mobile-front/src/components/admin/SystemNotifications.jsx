import React, { useState } from 'react';
import { adminApi } from '../../api/admin';
import { toastService } from '../../utils/toastService';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/ui/textarea';
import { Spinner } from '../common/Spinner';
import { FiSend, FiTrash2, FiClipboard } from 'react-icons/fi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../common/ui/select';

const mailTemplateSuggestions = [
  {
    id: 'system-update',
    title: 'System Maintenance Notification',
    message: 'Dear User,\n\nOur system will undergo scheduled maintenance on [DATE] from [START TIME] to [END TIME]. During this period, some services may be temporarily unavailable.\n\nWe apologize for any inconvenience.\n\nBest regards,\nAdmin Team'
  },
  {
    id: 'security-alert',
    title: 'Security Update Required',
    message: 'Important Security Notice:\n\nWe recommend updating your account password to ensure maximum security. Please log in to your account and change your password at your earliest convenience.\n\nIf you did not initiate this request, please contact our support team immediately.\n\nStay secure,\nYour Admin Team'
  },
  {
    id: 'new-feature',
    title: 'New Features Announcement',
    message: 'Exciting Updates Just Launched!\n\nWe\'ve added several new features to improve your experience:\n\n• [Feature 1]\n• [Feature 2]\n• [Feature 3]\n\nLog in now to explore these enhancements!\n\nHappy exploring,\nYour Development Team'
  },
  {
    id: 'billing-reminder',
    title: 'Upcoming Billing Notification',
    message: 'Billing Reminder:\n\nYour subscription is due for renewal on [DATE]. Please ensure your payment method is up to date to avoid any service interruptions.\n\nTo update your billing information, log in to your account or contact our support team.\n\nThank you,\nBilling Department'
  },
  {
    id: 'performance-improvement',
    title: 'Platform Performance Upgrades',
    message: 'Performance Optimization Update:\n\nWe\'ve implemented significant performance improvements to enhance your user experience:\n\n• Faster page load times\n• Reduced server response latency\n• Improved database query efficiency\n\nYou should notice a smoother, more responsive platform experience.\n\nBest regards,\nTechnical Team'
  },
  {
    id: 'privacy-policy-update',
    title: 'Privacy Policy Revision',
    message: 'Important Privacy Policy Update:\n\nWe have recently updated our privacy policy to provide greater transparency and protect your data. Key changes include:\n\n• Enhanced data protection measures\n• Clearer user consent mechanisms\n• Updated third-party data sharing guidelines\n\nPlease review the full updated policy on our website.\n\nSincerely,\nLegal & Compliance Team'
  },
  {
    id: 'account-verification',
    title: 'Account Verification Required',
    message: 'Account Verification Needed:\n\nTo ensure the security of your account, we require you to complete a quick verification process. Please click the verification link below within the next 24 hours:\n\n[VERIFICATION LINK]\n\nIf you did not request this verification, please contact our support team immediately.\n\nRegards,\nAccount Security Team'
  },
  {
    id: 'service-disruption',
    title: 'Temporary Service Disruption',
    message: 'Service Disruption Notice:\n\nWe are experiencing temporary service interruptions due to [REASON]. Our team is working diligently to resolve the issue and minimize any inconvenience.\n\nEstimated resolution time: [ESTIMATED TIME]\n\nWe apologize for any disruption and appreciate your patience.\n\nBest regards,\nCustomer Support Team'
  },
  {
    id: 'special-promotion',
    title: 'Exclusive Limited-Time Offer',
    message: 'Exclusive Offer Just for You!\n\nAs a valued user, we\'re excited to offer you a special promotion:\n\n• Discount: [DISCOUNT PERCENTAGE]\n• Valid Until: [EXPIRY DATE]\n• Promo Code: [PROMO CODE]\n\nDon\'t miss this opportunity to enhance your experience!\n\nHappy savings,\nMarketing Team'
  },
  {
    id: 'data-breach-notification',
    title: 'Proactive Security Notification',
    message: 'Important Security Notification:\n\nWe take the security of your information seriously. While our systems remain secure, we recommend taking the following precautionary steps:\n\n• Change your password\n• Enable two-factor authentication\n• Review recent account activity\n\nIf you notice any suspicious activity, contact our support team immediately.\n\nYour security is our priority,\nSecurity Response Team'
  }
];
export const SystemNotifications = () => {
  // Notification State
  const [title, setTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [loading, setLoading] = useState({
    notification: false,
    cleanup: false
  });

  // Validation Errors
  const [errors, setErrors] = useState({
    title: '',
    message: '',
    targetAudience: ''
  });

  const handleCopyTemplate = (template) => {
    setTitle(template.title);
    setMessage(template.message);
    toastService.success('Template copied to notification');
  };


  // Audience Options
  const audienceOptions = [
    { value: 'ALL_USERS', label: 'All Users' },
    { value: 'CUSTOMERS', label: 'Customers' },
    { value: 'SHOP_OWNERS', label: 'Shop Owners' }
  ];

  // Form Validation
  const validateForm = () => {
    const newErrors = {
      title: !title.trim() ? 'Title is required' : '',
      message: !message.trim() ? 'Message is required' : '',
      targetAudience: !targetAudience ? 'Target audience is required' : ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Send Notification Handler
  const handleSendNotification = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(prev => ({ ...prev, notification: true }));
      const notificationData = { 
        title: title.trim(), 
        message: message.trim(), 
        targetAudience 
      };

      await adminApi.sendSystemNotification(notificationData);
      
      toastService.success('Notification sent successfully!');
      
      // Reset form
      setTitle('');
      setMessage('');
      setTargetAudience('');
    } catch (error) {
      toastService.error(
        error.response?.data?.message || 
        'Failed to send notification. Please try again.'
      );
      console.error('Error sending notification:', error);
    } finally {
      setLoading(prev => ({ ...prev, notification: false }));
    }
  };

  // Cleanup Expired Tokens Handler
  const handleCleanupExpiredTokens = async () => {
    try {
      setLoading(prev => ({ ...prev, cleanup: true }));
      const deletedTokens = await adminApi.cleanupExpiredTokens();
      
      toastService.success(`Cleaned up ${deletedTokens} expired tokens`);
    } catch (error) {
      toastService.error('Failed to clean up expired tokens');
      console.error('Cleanup of expired tokens failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, cleanup: false }));
    }
  };
  

  return (
    <Card className="bg-gray-900 text-white shadow-2xl max-w-xl mx-auto">
      <CardHeader className="bg-gray-950 rounded-t-lg">
        <CardTitle className="text-white">System Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {/* Notification Title Input */}
        <div>
          <Input
            placeholder="Notification Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors(prev => ({ ...prev, title: '' }));
            }}
            className={`bg-gray-800 text-white border-gray-700 
              ${errors.title ? 'border-red-600' : ''}`}
          />
          {errors.title && (
            <p className="text-red-400 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Notification Message Input */}
        <div>
          <Textarea
            placeholder="Notification Message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setErrors(prev => ({ ...prev, message: '' }));
            }}
            rows={4}
            className={`bg-gray-800 text-white border-gray-700 
              ${errors.message ? 'border-red-600' : ''}`}
          />
          {errors.message && (
            <p className="text-red-400 text-sm mt-1">{errors.message}</p>
          )}
        </div>

        {/* Target Audience Dropdown */}
        <div>
          <Select 
            value={targetAudience} 
            onValueChange={(value) => {
              setTargetAudience(value);
              setErrors(prev => ({ ...prev, targetAudience: '' }));
            }}
          >
            <SelectTrigger className={`bg-gray-800 text-white border-gray-700 
              ${errors.targetAudience ? 'border-red-600' : ''}`}>
              <SelectValue placeholder="Select Target Audience" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 text-white">
              {audienceOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value} 
                  className="hover:bg-blue-900"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.targetAudience && (
            <p className="text-red-400 text-sm mt-1">{errors.targetAudience}</p>
          )}
        </div>

        {/* Send Notification Button */}
        <Button 
          onClick={handleSendNotification} 
          disabled={loading.notification}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white relative"
        >
          {loading.notification ? (
            <div className="flex items-center justify-center w-full">
              <Spinner size="sm" className="mr-2" />
              Sending Notification...
            </div>
          ) : (
            <>
              <FiSend className="mr-2" />
              Send Notification
            </>
          )}
        </Button>

        {/* Mail Template Suggestions Section */}
        <div className="border-t border-gray-700 pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-3 text-white">
            Quick Mail Templates
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {mailTemplateSuggestions.map((template) => (
              <Button
                key={template.id}
                onClick={() => handleCopyTemplate(template)}
                className="w-full bg-gray-800 hover:bg-blue-900 text-white text-left truncate"
              >
                <FiClipboard className="mr-2 flex-shrink-0" />
                <span className="truncate">{template.title}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Cleanup Expired Tokens Section */}
        <div className="border-t border-gray-700 pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-3 text-white">
            System Maintenance
          </h3>
          <Button 
            onClick={handleCleanupExpiredTokens} 
            disabled={loading.cleanup}
            className="w-full bg-red-900 hover:bg-red-800 text-white relative"
          >
            {loading.cleanup ? (
              <div className="flex items-center justify-center w-full">
                <Spinner size="sm" className="mr-2" />
                Cleaning Up Tokens...
              </div>
            ) : (
              <>
                <FiTrash2 className="mr-2" />
                Cleanup Expired Tokens
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
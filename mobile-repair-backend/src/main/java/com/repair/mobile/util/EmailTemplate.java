package com.repair.mobile.util;

import com.repair.mobile.enums.RequestStatus;

public class EmailTemplate {
    private static final String HTML_WRAPPER = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .header {
                    background-color: #2196F3;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                }
                .content {
                    padding: 20px;
                }
                .details-box {
                    background-color: #f8f9fa;
                    border-left: 4px solid #2196F3;
                    padding: 15px;
                    margin: 15px 0;
                }
                .status-badge {
                    display: inline-block;
                    padding: 5px 10px;
                    border-radius: 15px;
                    color: white;
                    font-weight: bold;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #2196F3;
                    color: white;
                    text-decoration: none;
                    border-radius: 3px;
                    margin: 10px 0;
                }
                .verification-code {
                    font-size: 24px;
                    font-weight: bold;
                    letter-spacing: 2px;
                    color: #2196F3;
                    text-align: center;
                    padding: 10px;
                    margin: 15px 0;
                    background-color: #f8f9fa;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                {content}
            </div>
        </body>
        </html>
    """;

    public static String getNewRequestHtml(String brand, String model, String category) {
        String content = """
            <div class="header">
                <h2>New Repair Request</h2>
            </div>
            <div class="content">
                <p>A new repair request has been submitted that matches your expertise!</p>
                
                <div class="details-box">
                    <h3>Device Details</h3>
                    <p><strong>Brand:</strong> %s</p>
                    <p><strong>Model:</strong> %s</p>
                    <p><strong>Category:</strong> %s</p>
                </div>
                
                <p>Please log in to submit your quote.</p>
                <center><a href="http://localhost:3000/shop-dashboard" class="button">View Request Details</a></center>
            </div>
        """.formatted(brand, model, category);
        
        return HTML_WRAPPER.replace("{content}", content);
    }

    public static String getQuoteNotificationHtml(String shopName, Double estimatedCost) {
        String content = """
            <div class="header">
                <h2>New Quote Received</h2>
            </div>
            <div class="content">
                <div class="details-box">
                    <h3>Quote Details</h3>
                    <p><strong>Shop:</strong> %s</p>
                    <p><strong>Estimated Cost:</strong> Rs.%.2f</p>
                </div>
                
                <p>Log in to view the complete quote details and accept if interested.</p>
                <center><a href="#" class="button">View Quote</a></center>
            </div>
        """.formatted(shopName, estimatedCost);
        
        return HTML_WRAPPER.replace("{content}", content);
    }

    public static String getQuoteAcceptedHtml(String customerName) {
        String content = """
            <div class="header">
                <h2>Quote Accepted!</h2>
            </div>
            <div class="content">
                <p>Great news! Your quote has been accepted by %s.</p>
                
                <div class="details-box">
                    <h3>Next Steps</h3>
                    <ol>
                        <li>View the complete order details</li>
                        <li>Contact the customer to arrange device pickup</li>
                        <li>Begin the repair process</li>
                        <li>Keep updating the repair status</li>
                    </ol>
                </div>
                
                <center><a href="#" class="button">View Order Details</a></center>
            </div>
        """.formatted(customerName);
        
        return HTML_WRAPPER.replace("{content}", content);
    }

    public static String getStatusUpdateHtml(RequestStatus status, String brand, String model) {
        String statusColor = switch (status) {
            case PENDING -> "#FFA500";
            case IN_PROGRESS -> "#2196F3";
            case COMPLETED -> "#4CAF50";
            case CANCELLED -> "#f44336";
            default -> "#757575";
        };

        String content = """
            <div class="header">
                <h2>Repair Status Update</h2>
            </div>
            <div class="content">
                <div class="details-box">
                    <h3>Repair Details</h3>
                    <p><strong>Device:</strong> %s %s</p>
                    <p><strong>Status:</strong> 
                        <span class="status-badge" style="background-color: %s">%s</span>
                    </p>
                </div>
                
                <p>Log in to view more details about your repair status.</p>
                <center><a href="#" class="button">Track Repair</a></center>
            </div>
        """.formatted(brand, model, statusColor, status);
        
        return HTML_WRAPPER.replace("{content}", content);
    }

    public static String getVerificationEmailHtml(String appUrl, String token) {
        String content = """
            <div class="header">
                <h2>Verify Your Email Address</h2>
            </div>
            <div class="content">
                <p>Welcome! Please verify your email address to complete your registration.</p>
                
                <div class="details-box">
                    <p>Click the button below to verify your email address. If you didn't create an account, you can safely ignore this email.</p>
                </div>
                
                <center>
                    <a href="%s/verify-email?token=%s" class="button">Verify Email Address</a>
                </center>
                
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="%s/verify-email?token=%s">%s/verify-email?token=%s</a>
                </p>
            </div>
        """.formatted(appUrl, token, appUrl, token, appUrl, token);
        
        return HTML_WRAPPER.replace("{content}", content);
    }

    public static String getPasswordResetHtml(String appUrl, String token) {
        String content = """
            <div class="header">
                <h2>Reset Your Password</h2>
            </div>
            <div class="content">
                <p>We received a request to reset your password.</p>
                
                <div class="details-box">
                    <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
                    <p>If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
                
                <center>
                    <a href="%s/reset-password?token=%s" class="button">Reset Password</a>
                </center>
                
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="%s/reset-password?token=%s">%s/reset-password?token=%s</a>
                </p>
            </div>
        """.formatted(appUrl, token, appUrl, token, appUrl, token);
        
        return HTML_WRAPPER.replace("{content}", content);
    }

    public static String getWelcomeEmailHtml() {
        String content = """
            <div class="header">
                <h2>Welcome to Mobile Repair Platform!</h2>
            </div>
            <div class="content">
                <p>Thank you for joining our platform! We're excited to have you onboard.</p>
                
                <div class="details-box">
                    <h3>Getting Started</h3>
                    <ul>
                        <li>Complete your profile</li>
                        <li>Browse available repair services</li>
                        <li>Submit repair requests</li>
                        <li>Track repair status</li>
                    </ul>
                </div>
                
                <p>If you have any questions or need assistance, our support team is here to help.</p>
                
                <center>
                    <a href="#" class="button">Visit Dashboard</a>
                </center>
            </div>
        """;
        
        return HTML_WRAPPER.replace("{content}", content);
    }

    public static String getPasswordChangedHtml() {
        String content = """
            <div class="header">
                <h2>Password Changed Successfully</h2>
            </div>
            <div class="content">
                <div class="details-box">
                    <p>Your password has been successfully changed. If you did not make this change, please contact our support team immediately.</p>
                </div>
                
                <p>For security reasons, you may need to log in again on your devices.</p>
                
                <center>
                    <a href="#" class="button">Go to Login</a>
                </center>
                
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    If you didn't change your password, please secure your account by:
                    <ul>
                        <li>Changing your password immediately</li>
                        <li>Enabling two-factor authentication</li>
                        <li>Contacting our support team</li>
                    </ul>
                </p>
            </div>
        """;
        
        return HTML_WRAPPER.replace("{content}", content);
    }

    public static String getRepairStartedHtml(String deviceBrand, String deviceModel) {
        String content = """
            <div class="header">
            <h2>Repair Started</h2>
            </div>
            <div class="content">
            <p>We have started the repair process for your device.</p>
            
            <div class="details-box">
                <h3>Device Details</h3>
                <p><strong>Brand:</strong> %s</p>
                <p><strong>Model:</strong> %s</p>
            </div>
            
            <p>You can track the progress of your repair by logging into your account.</p>
            <center><a href="#" class="button">Track Repair</a></center>
            </div>
        """.formatted(deviceBrand, deviceModel);
        
        return HTML_WRAPPER.replace("{content}", content);
    }

    public static String getReviewNotificationHtml(String fullName, Integer rating) {
        String content = """
            <div class="header">
                <h2>New Review Received</h2>
            </div>
            <div class="content">
                <div class="details-box">
                    <h3>Review Details</h3>
                    <p><strong>Customer:</strong> %s</p>
                    <p><strong>Rating:</strong> %d/5</p>
                </div>
                
                <p>Log in to view the complete review details and respond if needed.</p>
                <center><a href="#" class="button">View Review</a></center>
            </div>
        """.formatted(fullName, rating);
        
        return HTML_WRAPPER.replace("{content}", content);
    }
}
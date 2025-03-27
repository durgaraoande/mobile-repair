package com.repair.mobile.service;

import com.repair.mobile.exception.EmailSendException;
import com.repair.mobile.entity.RepairShop;
import com.repair.mobile.enums.RequestStatus;
import com.repair.mobile.util.EmailTemplate;

import jakarta.annotation.PreDestroy;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import com.google.common.util.concurrent.RateLimiter;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender emailSender;
    private static final String FROM_ADDRESS = "no-reply@trial-351ndgwx0vr4zqx8.mlsender.net";
    
    private final ExecutorService emailExecutor = Executors.newFixedThreadPool(5);
    private static final int EMAILS_PER_SECOND = 10;
    private final RateLimiter rateLimiter = RateLimiter.create(EMAILS_PER_SECOND);

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    @Async
    public CompletableFuture<Void> sendVerificationEmail(String toEmail, String token) {
        log.info("Sending verification email to: {}", toEmail);

        try {
            rateLimiter.acquire();
            String htmlContent = EmailTemplate.getVerificationEmailHtml(appUrl, token);
            
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_ADDRESS);
            helper.setTo(toEmail);
            helper.setSubject("Verify Your Email Address");
            helper.setText(htmlContent, true);

            sendEmailWithRetry(message);
        } catch (Exception e) {
            log.error("Failed to send verification email", e);
            throw new EmailSendException(e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendPasswordResetEmail(String toEmail, String token) {
        log.info("Sending password reset email to: {}", toEmail);

        try {
            rateLimiter.acquire();
            String htmlContent = EmailTemplate.getPasswordResetHtml(appUrl, token);
            
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_ADDRESS);
            helper.setTo(toEmail);
            helper.setSubject("Reset Your Password");
            helper.setText(htmlContent, true);

            sendEmailWithRetry(message);
        } catch (Exception e) {
            log.error("Failed to send password reset email", e);
            throw new EmailSendException(e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendWelcomeEmail(String toEmail) {
        log.info("Sending welcome email to: {}", toEmail);

        try {
            rateLimiter.acquire();
            String htmlContent = EmailTemplate.getWelcomeEmailHtml();
            
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_ADDRESS);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to Our Platform");
            helper.setText(htmlContent, true);

            sendEmailWithRetry(message);
        } catch (Exception e) {
            log.error("Failed to send welcome email", e);
            throw new EmailSendException(e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendPasswordChangeNotification(String toEmail) {
        log.info("Sending password change notification to: {}", toEmail);

        try {
            rateLimiter.acquire();
            String htmlContent = EmailTemplate.getPasswordChangedHtml();
            
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_ADDRESS);
            helper.setTo(toEmail);
            helper.setSubject("Password Changed Successfully");
            helper.setText(htmlContent, true);

            sendEmailWithRetry(message);
        } catch (Exception e) {
            log.error("Failed to send password change notification", e);
            throw new EmailSendException(e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendNewRequestNotificationBulk(List<RepairShop> shops, 
            String brand, String model, String category) {
        log.info("Sending bulk new request notifications to {} shops", shops.size());

        List<CompletableFuture<Void>> futures = shops.stream()
            .map(shop -> CompletableFuture.runAsync(() -> {
                try {
                    rateLimiter.acquire();
                    String htmlContent = EmailTemplate.getNewRequestHtml(brand, model, category);
                    
                    MimeMessage message = emailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                    helper.setFrom(FROM_ADDRESS);
                    helper.setTo(shop.getOwner().getEmail());
                    helper.setSubject("New Repair Request Available");
                    helper.setText(htmlContent, true);
                    
                    sendEmailWithRetry(message);
                } catch (Exception e) {
                    log.error("Failed to send email to shop {}: {}", 
                        shop.getId(), e.getMessage());
                }
            }, emailExecutor))
            .collect(Collectors.toList());

        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
    }

    @Async
    public CompletableFuture<Void> sendQuoteNotification(String toEmail, 
            String shopName, Double estimatedCost) {
        log.info("Sending quote notification to: {}", toEmail);

        try {
            rateLimiter.acquire();
            String htmlContent = EmailTemplate.getQuoteNotificationHtml(shopName, estimatedCost);
            
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_ADDRESS);
            helper.setTo(toEmail);
            helper.setSubject("New Quote Received");
            helper.setText(htmlContent, true);

            sendEmailWithRetry(message);
        } catch (Exception e) {
            log.error("Failed to send quote notification", e);
            throw new EmailSendException(e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendQuoteAcceptedNotification(String toEmail, String customerName) {
        log.info("Sending quote acceptance notification to: {}", toEmail);

        try {
            rateLimiter.acquire();
            String htmlContent = EmailTemplate.getQuoteAcceptedHtml(customerName);
            
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_ADDRESS);
            helper.setTo(toEmail);
            helper.setSubject("Quote Accepted");
            helper.setText(htmlContent, true);

            sendEmailWithRetry(message);
        } catch (Exception e) {
            log.error("Failed to send quote accepted notification", e);
            throw new EmailSendException(e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    public void sendRepairStartedNotification(String email, String deviceBrand, String deviceModel) {
        log.info("Sending repair started notification to: {}", email);

        try {
            rateLimiter.acquire();
            String htmlContent = EmailTemplate.getRepairStartedHtml(deviceBrand, deviceModel);
            
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_ADDRESS);
            helper.setTo(email);
            helper.setSubject("Repair Started");
            helper.setText(htmlContent, true);

            sendEmailWithRetry(message);
        } catch (Exception e) {
            log.error("Failed to send repair started notification", e);
            throw new EmailSendException(e.getMessage());
        }
    }

    @Async
    public CompletableFuture<Void> sendStatusUpdateNotification(String toEmail, RequestStatus status,
                                             String brand, String model) {
        log.info("Sending status update notification to: {}", toEmail);

        try {
            rateLimiter.acquire();
            String htmlContent = EmailTemplate.getStatusUpdateHtml(status, brand, model);
            
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_ADDRESS);
            helper.setTo(toEmail);
            helper.setSubject("Repair Status Update");
            helper.setText(htmlContent, true);

            sendEmailWithRetry(message);
        } catch (Exception e) {
            log.error("Failed to send status update notification", e);
            throw new EmailSendException(e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    private void sendEmailWithRetry(MimeMessage message) {
        int maxRetries = 3;
        int retryDelayMs = 1000;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                emailSender.send(message);
                log.info("Successfully sent email to: {}", 
                    message.getAllRecipients()[0]);
                return;
            } catch (Exception e) {
                if (attempt == maxRetries) {
                    throw new EmailSendException("Failed to send email after " + 
                        maxRetries + " attempts: " + e.getMessage());
                }
                log.warn("Email send attempt {} failed, retrying in {}ms", 
                    attempt, retryDelayMs);
                try {
                    Thread.sleep(retryDelayMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new EmailSendException("Email send interrupted");
                }
                retryDelayMs *= 2;
            }
        }
    }

    @PreDestroy
    public void cleanup() {
        emailExecutor.shutdown();
        try {
            if (!emailExecutor.awaitTermination(60, TimeUnit.SECONDS)) {
                emailExecutor.shutdownNow();
            }
        } catch (InterruptedException e) {
            emailExecutor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    public void sendReviewNotification(String email, String fullName, Integer rating) {
        log.info("Sending review notification to: {}", email);

        try {
            rateLimiter.acquire();
            String htmlContent = EmailTemplate.getReviewNotificationHtml(fullName, rating);
            
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_ADDRESS);
            helper.setTo(email);
            helper.setSubject("New Review Received");
            helper.setText(htmlContent, true);

            sendEmailWithRetry(message);
        } catch (Exception e) {
            log.error("Failed to send review notification", e);
            throw new EmailSendException(e.getMessage());
        }
    }

    public void sendNotification(String email, String title, String message, String string, Object object) {
        log.info("Sending notification to: {}", email);

        try {
            rateLimiter.acquire();
            String htmlContent = EmailTemplate.getNotificationHtml(title, message);
            
            MimeMessage mimeMessage = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(FROM_ADDRESS);
            helper.setTo(email);
            helper.setSubject(title);
            helper.setText(htmlContent, true);

            sendEmailWithRetry(mimeMessage);
        } catch (Exception e) {
            log.error("Failed to send notification", e);
            throw new EmailSendException(e.getMessage());
        }
    }

    
}
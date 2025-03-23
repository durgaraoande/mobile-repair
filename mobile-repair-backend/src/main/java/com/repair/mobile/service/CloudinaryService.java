package com.repair.mobile.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.repair.mobile.exception.FileStorageException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;
    
    public String uploadImage(MultipartFile file) {
        try {
            Map<String, String> params = new HashMap<>();
            params.put("folder", "repair-requests");
            
            Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                params
            );
            
            return uploadResult.get("public_id").toString();
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new FileStorageException("Failed to upload image to Cloudinary", e);
        }
    }
    
    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, Map.of());
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary", e);
            throw new FileStorageException("Failed to delete image from Cloudinary", e);
        }
    }
}
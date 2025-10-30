package com.example.demo.controller;

import com.example.demo.model.Enquiry;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.EnquiryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enquiries")
public class EnquiryController {

    @Autowired
    private EnquiryService enquiryService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByEmail(username)
                
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<Enquiry> createEnquiry(@RequestParam String subject, @RequestParam String message) {
        User user = getCurrentUser();
        Enquiry enquiry = enquiryService.createEnquiry(user, subject, message);
        return ResponseEntity.ok(enquiry);
    }

    @GetMapping
    public ResponseEntity<List<Enquiry>> getMyEnquiries() {
        User user = getCurrentUser();
        List<Enquiry> enquiries = enquiryService.getEnquiriesByUser(user);
        return ResponseEntity.ok(enquiries);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enquiry> getEnquiryById(@PathVariable Long id) {
        return enquiryService.getEnquiryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Admin only endpoint to update enquiry status
    @PutMapping("/{id}/status")
    public ResponseEntity<Enquiry> updateEnquiryStatus(@PathVariable Long id, @RequestParam String status) {
        Enquiry updatedEnquiry = enquiryService.updateEnquiryStatus(id, status);
        return ResponseEntity.ok(updatedEnquiry);
    }

    // Admin only endpoint to get all enquiries
    @GetMapping("/all")
    public ResponseEntity<List<Enquiry>> getAllEnquiries() {
        List<Enquiry> enquiries = enquiryService.getAllEnquiries();
        return ResponseEntity.ok(enquiries);
    }
}


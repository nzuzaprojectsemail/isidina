package com.example.demo.service;

import com.example.demo.model.Enquiry;
import com.example.demo.model.User;
import com.example.demo.repository.EnquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EnquiryService {

    @Autowired
    private EnquiryRepository enquiryRepository;

    public Enquiry createEnquiry(User user, String subject, String message) {
        Enquiry enquiry = new Enquiry();
        enquiry.setUser(user);
        enquiry.setSubject(subject);
        enquiry.setMessage(message);
        enquiry.setEnquiryDate(LocalDateTime.now());
        enquiry.setStatus("PENDING");
        return enquiryRepository.save(enquiry);
    }

    public List<Enquiry> getEnquiriesByUser(User user) {
        return enquiryRepository.findByUser(user);
    }

    public Optional<Enquiry> getEnquiryById(Long id) {
        return enquiryRepository.findById(id);
    }

    public Enquiry updateEnquiryStatus(Long id, String status) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enquiry not found"));
        enquiry.setStatus(status);
        return enquiryRepository.save(enquiry);
    }

    public List<Enquiry> getAllEnquiries() {
        return enquiryRepository.findAll();
    }
}


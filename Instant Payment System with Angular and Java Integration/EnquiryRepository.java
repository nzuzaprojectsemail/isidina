package com.example.demo.repository;

import com.example.demo.model.Enquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EnquiryRepository extends JpaRepository<Enquiry, String> {
    List<Enquiry> findByUserId(String userId);
}


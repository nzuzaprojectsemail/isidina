package com.example.demo.repository;

import com.example.demo.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findBySenderUserId(String senderUserId);
    Optional<Transaction> findByVoucherNumber(String voucherNumber);
}


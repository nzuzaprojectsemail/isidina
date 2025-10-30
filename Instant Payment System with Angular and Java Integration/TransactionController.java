package com.example.demo.controller;

import com.example.demo.model.Transaction;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/send")
    public ResponseEntity<Transaction> sendMoney(@RequestParam String receiverEmail, @RequestParam BigDecimal amount) {
        User sender = getCurrentUser();
        Transaction transaction = transactionService.sendMoney(sender, receiverEmail, amount);
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/withdraw/full")
    public ResponseEntity<Transaction> fullWithdrawal(@RequestParam BigDecimal amount) {
        User user = getCurrentUser();
        Transaction transaction = transactionService.fullWithdrawal(user, amount);
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/withdraw/partial")
    public ResponseEntity<Transaction> partialWithdrawal(@RequestParam BigDecimal amount) {
        User user = getCurrentUser();
        Transaction transaction = transactionService.partialWithdrawal(user, amount);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Transaction>> getTransactionHistory() {
        User user = getCurrentUser();
        List<Transaction> transactions = transactionService.getTransactionsByUser(user);
        return ResponseEntity.ok(transactions);
    }
}


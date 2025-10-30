package com.example.demo.service;

import com.example.demo.model.Transaction;
import com.example.demo.model.User;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.05"); // 5%
    private static final BigDecimal VAT_RATE = new BigDecimal("0.15"); // 15%

    @Transactional
    @PreAuthorize("#sender.email == authentication.principal.username")
    public Transaction sendMoney(User sender, String receiverEmail, BigDecimal amount) {
        Optional<User> receiverOptional = userRepository.findByEmail(receiverEmail);
        if (receiverOptional.isEmpty()) {
            throw new RuntimeException("Receiver not found");
        }
        User receiver = receiverOptional.get();

        BigDecimal commission = amount.multiply(COMMISSION_RATE);
        BigDecimal vat = commission.multiply(VAT_RATE);
        BigDecimal totalDeduction = amount.add(commission).add(vat);

        if (sender.getBalance().compareTo(totalDeduction) < 0) {
            throw new RuntimeException("Insufficient balance to cover amount, commission and VAT");
        }

        sender.setBalance(sender.getBalance().subtract(totalDeduction));
        receiver.setBalance(receiver.getBalance().add(amount));

        userRepository.save(sender);
        userRepository.save(receiver);

        Transaction transaction = new Transaction();
        transaction.setSender(sender);
        transaction.setReceiver(receiver);
        transaction.setAmount(amount);
        transaction.setCommission(commission);
        transaction.setVat(vat);
        transaction.setTotalAmount(totalDeduction);
        transaction.setType("SEND_MONEY");
        transaction.setTransactionDate(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    @Transactional
    @PreAuthorize("#user.email == authentication.principal.username")
    public Transaction fullWithdrawal(User user, BigDecimal amount) {
        if (user.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds for full withdrawal");
        }

        user.setBalance(user.getBalance().subtract(amount));
        userRepository.save(user);

        Transaction transaction = new Transaction();
        transaction.setSender(user);
        transaction.setReceiver(user); // Self-transaction for withdrawal
        transaction.setAmount(amount);
        transaction.setCommission(BigDecimal.ZERO);
        transaction.setVat(BigDecimal.ZERO);
        transaction.setTotalAmount(amount);
        transaction.setType("FULL_WITHDRAWAL");
        transaction.setTransactionDate(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    @Transactional
    @PreAuthorize("#user.email == authentication.principal.username")
    public Transaction partialWithdrawal(User user, BigDecimal amount) {
        if (user.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds for partial withdrawal");
        }

        user.setBalance(user.getBalance().subtract(amount));
        userRepository.save(user);

        Transaction transaction = new Transaction();
        transaction.setSender(user);
        transaction.setReceiver(user); // Self-transaction for withdrawal
        transaction.setAmount(amount);
        transaction.setCommission(BigDecimal.ZERO);
        transaction.setVat(BigDecimal.ZERO);
        transaction.setTotalAmount(amount);
        transaction.setType("PARTIAL_WITHDRAWAL");
        transaction.setTransactionDate(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    @PreAuthorize("#user.email == authentication.principal.username")
    public List<Transaction> getTransactionsByUser(User user) {
        return transactionRepository.findBySenderOrReceiver(user, user);
    }
}


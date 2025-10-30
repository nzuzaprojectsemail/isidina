package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(nullable = false)
    private String senderUserId;
    @Column(nullable = false)
    private String receiverCellNumber;
    @Column(nullable = false)
    private String transactionType;
    @Column(nullable = false)
    private BigDecimal amount;
    private BigDecimal commissionAmount;
    private BigDecimal vatAmount;
    private String withdrawalPin;
    @Column(unique = true)
    private String voucherNumber;
    @Column(nullable = false)
    private String status;
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    private String receiverName;
    private String receiverSurname;
    private String receiverIdPassport;
    private String receiverAddress;
}


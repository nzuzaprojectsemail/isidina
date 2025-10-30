package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final BigDecimal INITIAL_BALANCE = new BigDecimal(1000);

    public User registerNewUser(String email, String password, String firstName, String lastName, String idPassport, String physicalAddress, String cellNumber) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.findByIdPassport(idPassport).isPresent()) {
            throw new RuntimeException("ID/Passport is already registered!");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setIdPassport(idPassport);
        user.setPhysicalAddress(physicalAddress);
        user.setCellNumber(cellNumber);
        user.setBalance(INITIAL_BALANCE);
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}


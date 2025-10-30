package com.example.demo.service;

import com.example.demo.model.Admin;
import com.example.demo.model.Organization;
import com.example.demo.model.User;
import com.example.demo.repository.AdminRepository;
import com.example.demo.repository.OrganizationRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Admin registerNewAdmin(String username, String email, String password) {
        if (adminRepository.findByUsername(username) != null) {
            throw new RuntimeException("Admin username already exists");
        }
        Admin admin = new Admin();
        admin.setUsername(username);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        return adminRepository.save(admin);
    }

    public Optional<Admin> findByUsername(String username) {
        return Optional.ofNullable(adminRepository.findByUsername(username));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(Long id, User updatedUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEmail(updatedUser.getEmail());
        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());
        user.setIdPassport(updatedUser.getIdPassport());
        user.setPhysicalAddress(updatedUser.getPhysicalAddress());
        user.setCellNumber(updatedUser.getCellNumber());
        user.setBalance(updatedUser.getBalance());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public Organization createOrganization(Organization organization) {
        if (organizationRepository.findByName(organization.getName()) != null) {
            throw new RuntimeException("Organization with this name already exists");
        }
        return organizationRepository.save(organization);
    }

    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    public Optional<Organization> getOrganizationById(Long id) {
        return organizationRepository.findById(id);
    }

    public Organization updateOrganization(Long id, Organization updatedOrganization) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        organization.setName(updatedOrganization.getName());
        organization.setAddress(updatedOrganization.getAddress());
        organization.setContactEmail(updatedOrganization.getContactEmail());
        return organizationRepository.save(organization);
    }

    public void deleteOrganization(Long id) {
        organizationRepository.deleteById(id);
    }
}


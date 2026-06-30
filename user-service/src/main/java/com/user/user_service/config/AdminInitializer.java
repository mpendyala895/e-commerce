package com.user.user_service.config;

import com.user.user_service.model.Role;
import com.user.user_service.model.User;
import com.user.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByRole(Role.ADMIN)) {
            log.info("No admin user found. Creating default admin user...");
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("System")
                    .email("admin@ecommerce.com")
                    .password(passwordEncoder.encode("adminpassword"))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created successfully with email 'admin@ecommerce.com' and password 'adminpassword'");
        } else {
            log.info("Admin user already exists. Skipping default admin initialization.");
        }
    }
}

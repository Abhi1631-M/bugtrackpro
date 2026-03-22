package net.abhishek.bugtrackpro.config;

import lombok.RequiredArgsConstructor;
import net.abhishek.bugtrackpro.entity.AccountStatus;
import net.abhishek.bugtrackpro.entity.Role;
import net.abhishek.bugtrackpro.entity.User;
import net.abhishek.bugtrackpro.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Only create user if it doesn't exist
        if (userRepository.findByEmail("devu@example.com").isEmpty()) {
            User user = User.builder()
                    .name("Devu Test")
                    .email("devu@example.com")
                    .password(passwordEncoder.encode("D12345678"))
                    .role(Role.SUPER_ADMIN)
                    .status(AccountStatus.ACTIVE)
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(user);
            System.out.println("✅ Test user created: devu@example.com / D12345678");
        } else {
            System.out.println("ℹ️ Test user already exists: devu@example.com");
        }
    }
}
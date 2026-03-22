package net.abhishek.bugtrackpro.security;

import lombok.RequiredArgsConstructor;
import net.abhishek.bugtrackpro.entity.User;
import net.abhishek.bugtrackpro.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthUtil {

    private final UserRepository userRepository;

    /**
     * Returns the currently authenticated user by reading their email
     * from the Spring Security context (set by JwtAuthFilter).
     */
    public User getLoggedUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + email));
    }
}

package net.abhishek.bugtrackpro.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import net.abhishek.bugtrackpro.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private static final long JWT_EXPIRATION = 1000 * 60 * 60; // 1 hour

    // ✅ SINGLE SIGNING KEY (returns SecretKey instead of Key)
    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ✅ GENERATE TOKEN
    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(getSignKey())  // No need to specify algorithm
                .compact();
    }

    // ✅ EXTRACT EMAIL
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    // ✅ VALIDATE TOKEN
    public boolean isTokenValid(String token, User user) {
        final String email = extractUsername(token);
        return email.equals(user.getEmail()) && !isTokenExpired(token);
    }

    // ✅ CHECK EXPIRATION
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    // ✅ SINGLE CLAIMS PARSER (updated for 0.12.x)
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
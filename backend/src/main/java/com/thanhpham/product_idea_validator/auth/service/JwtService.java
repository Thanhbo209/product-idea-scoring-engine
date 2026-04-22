package com.thanhpham.product_idea_validator.auth.service;

import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    public String generateToken(UUID userId, String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claims(Map.of("userId", userId.toString(), "role", role))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // Lấy khóa ký từ chuỗi bí mật
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // Hàm trừu tượng để trích xuất thông tin từ token
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claimsResolver.apply(claims);
    }

    // EMAIL identity
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // role từ token
    public String extractUserRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(extractClaim(token, c -> c.get("userId", String.class)));
    }

    // Kiểm tra tính hợp lệ của token
    public boolean isTokenValid(String token, UserDetails userDetails) {
        String email = extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // Kiểm tra xem token đã hết hạn chưa
    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }
}

// Đổi subject từ email sang userId vì email có thể thay đổi, nhưng userId thì
// không. Điều này giúp token ổn định hơn khi người dùng cập nhật thông tin cá
// nhân.
// Thêm role vào token để dễ dàng kiểm tra quyền truy cập mà không cần phải truy
// vấn cơ sở dữ liệu mỗi lần xác thực token.
// Sử dụng Claims để lưu trữ thông tin tùy chỉnh (userId, email, role) trong
// token, giúp việc trích xuất thông tin này dễ dàng hơn khi xác thực token.

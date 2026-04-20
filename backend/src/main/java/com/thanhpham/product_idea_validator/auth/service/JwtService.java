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
                // Sử dụng userId làm subject của token vì email có thể thay đổi, nhưng userId
                // thì không
                .subject(userId.toString())
                .claims(Map.of(
                        "userId", userId.toString(),
                        "email", email,
                        "role", role))
                .issuedAt(new Date()) // thời điểm token được tạo
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs)) // thời điểm token hết hạn
                .signWith(getSigningKey()) // ký token bằng khóa bí mật
                .compact(); // tạo token dưới dạng chuỗi compact (header.payload.signature)
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

    // userId từ token
    public String extractUserId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // email từ token
    public String extractEmail(String token) {
        return extractClaim(token, claims -> claims.get("email", String.class));
    }

    // role từ token
    public String extractUserRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    // Kiểm tra tính hợp lệ của token
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
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

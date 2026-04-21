package com.thanhpham.product_idea_validator.auth.service;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.thanhpham.product_idea_validator.auth.DTO.AuthResponse;
import com.thanhpham.product_idea_validator.auth.DTO.LoginRequest;
import com.thanhpham.product_idea_validator.auth.DTO.RegisterRequest;
import com.thanhpham.product_idea_validator.user.model.User;
import com.thanhpham.product_idea_validator.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(User.Role.USER)
                .isVerified(false)
                .build();

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Email is already in use", e);
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return buildAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        // Sử dụng AuthenticationManager để xác thực email và password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        // Nếu xác thực thành công, Spring Security sẽ trả về một đối tượng
        // Authentication chứa thông tin người dùng
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Lấy email từ UserDetails để truy vấn thông tin user trong database
        String email = userDetails.getUsername();

        // Lấy thông tin user từ database để kiểm tra trạng thái và tạo token
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        // if (!user.isVerified()) {
        // throw new IllegalStateException("Email not verified");
        // }

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name());

        return buildAuthResponse(user, token);
    }

    public AuthResponse getUserInfo(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}

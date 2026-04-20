package com.thanhpham.product_idea_validator.auth.DTO;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private UUID userId;
    private String email;
    private String fullName;
    private String role;
}

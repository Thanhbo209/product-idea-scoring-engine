package com.thanhpham.product_idea_validator.auth.service;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.UUID;

public class CustomUserPrincipal implements UserDetails {

    private final UUID userId;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserPrincipal(
            UUID userId,
            String email,
            String password,
            Collection<? extends GrantedAuthority> authorities) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    // internal use only
    public UUID getUserId() {
        return userId;
    }

    @Override
    public String getUsername() {
        return email; // IMPORTANT FIX
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
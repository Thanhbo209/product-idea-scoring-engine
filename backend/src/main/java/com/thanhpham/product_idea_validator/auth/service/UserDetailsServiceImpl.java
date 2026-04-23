package com.thanhpham.product_idea_validator.auth.service;

import com.thanhpham.product_idea_validator.user.model.User;
import com.thanhpham.product_idea_validator.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

        private final UserRepository userRepository;

        @Override
        public UserDetails loadUserByUsername(String email)
                        throws UsernameNotFoundException {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                return new CustomUserPrincipal(
                                user.getId(),
                                user.getEmail(),
                                user.getPasswordHash(),
                                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                                user.isVerified());
        }
}
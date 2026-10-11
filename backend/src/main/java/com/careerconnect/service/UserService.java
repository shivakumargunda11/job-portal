package com.careerconnect.service;

import com.careerconnect.config.JwtUtil;
import com.careerconnect.dto.AuthResponse;
import com.careerconnect.dto.RegisterRequest;
import com.careerconnect.entity.User;
import com.careerconnect.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRoles().stream()
                        .map(r -> r.replace("ROLE_", ""))
                        .toArray(String[]::new))
                .build();
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.findByUsername(req.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already taken");
        }
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        Set<String> roles = new HashSet<>();
        String role = req.getRole() != null ? req.getRole().toUpperCase() : "STUDENT";
        if (role.equals("RECRUITER")) {
            roles.add("ROLE_RECRUITER");
        } else {
            roles.add("ROLE_STUDENT");
        }
        user.setRoles(roles);
        userRepository.save(user);
        UserDetails userDetails = loadUserByUsername(user.getUsername());
        String token = jwtUtil.generateToken(userDetails);
        return new AuthResponse(token, user.getUsername(), user.getFullName(), user.getRoles());
    }

    public AuthResponse loginAndGetToken(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        UserDetails userDetails = loadUserByUsername(username);
        String token = jwtUtil.generateToken(userDetails);
        return new AuthResponse(token, user.getUsername(), user.getFullName(), user.getRoles());
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }
}

package com.careerconnect.dto;

import java.util.Set;

public class AuthResponse {
    private String token;
    private String username;
    private String fullName;
    private Set<String> roles;

    public AuthResponse(String token, String username, String fullName, Set<String> roles) {
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.roles = roles;
    }

    public String getToken() { return token; }
    public String getUsername() { return username; }
    public String getFullName() { return fullName; }
    public Set<String> getRoles() { return roles; }
}

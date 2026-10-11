package com.careerconnect.dto;

import jakarta.validation.constraints.NotBlank;

public class OpportunityRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String organization;

    private String description;

    @NotBlank
    private String category; // JOB, INTERNSHIP, HACKATHON, COMPETITION, SCHOLARSHIP

    private String imageUrl;
    private String location;
    private String workMode;
    private String eligibility;
    private String requiredSkills;
    private String deadline; // accept as string yyyy-MM-dd
    private String reward;
    private boolean published = true;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }
    public String getEligibility() { return eligibility; }
    public void setEligibility(String eligibility) { this.eligibility = eligibility; }
    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }
    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
    public String getReward() { return reward; }
    public void setReward(String reward) { this.reward = reward; }
    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }
}

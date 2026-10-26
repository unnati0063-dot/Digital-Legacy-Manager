package com.digitallegacy.payload;

import java.util.List;
import java.util.Map;

public class DashboardStatsDto {

    private long totalDocuments;
    private long totalFamilyMembers;
    private long expiringSoonDocuments;
    private long expiredDocuments;
    private long totalAssets;
    private long totalContacts;
    private long pendingInvitations;
    private long totalDigitalAccounts;
    private long totalInsurancePolicies;
    private long totalLegacyInstructions;

    private List<?> recentDocuments;
    private List<?> recentActivities;
    private List<?> upcomingExpiries;
    private List<?> importantInformation;
    private Map<String, Long> documentsByCategory;

    public DashboardStatsDto() {
    }

    public long getTotalDocuments() {
        return totalDocuments;
    }

    public void setTotalDocuments(long totalDocuments) {
        this.totalDocuments = totalDocuments;
    }

    public long getTotalFamilyMembers() {
        return totalFamilyMembers;
    }

    public void setTotalFamilyMembers(long totalFamilyMembers) {
        this.totalFamilyMembers = totalFamilyMembers;
    }

    public long getExpiringSoonDocuments() {
        return expiringSoonDocuments;
    }

    public void setExpiringSoonDocuments(long expiringSoonDocuments) {
        this.expiringSoonDocuments = expiringSoonDocuments;
    }

    public long getExpiredDocuments() {
        return expiredDocuments;
    }

    public void setExpiredDocuments(long expiredDocuments) {
        this.expiredDocuments = expiredDocuments;
    }

    public long getTotalAssets() {
        return totalAssets;
    }

    public void setTotalAssets(long totalAssets) {
        this.totalAssets = totalAssets;
    }

    public long getTotalContacts() {
        return totalContacts;
    }

    public void setTotalContacts(long totalContacts) {
        this.totalContacts = totalContacts;
    }

    public long getPendingInvitations() {
        return pendingInvitations;
    }

    public void setPendingInvitations(long pendingInvitations) {
        this.pendingInvitations = pendingInvitations;
    }

    public long getTotalDigitalAccounts() {
        return totalDigitalAccounts;
    }

    public void setTotalDigitalAccounts(long totalDigitalAccounts) {
        this.totalDigitalAccounts = totalDigitalAccounts;
    }

    public long getTotalInsurancePolicies() {
        return totalInsurancePolicies;
    }

    public void setTotalInsurancePolicies(long totalInsurancePolicies) {
        this.totalInsurancePolicies = totalInsurancePolicies;
    }

    public long getTotalLegacyInstructions() {
        return totalLegacyInstructions;
    }

    public void setTotalLegacyInstructions(long totalLegacyInstructions) {
        this.totalLegacyInstructions = totalLegacyInstructions;
    }

    public List<?> getRecentDocuments() {
        return recentDocuments;
    }

    public void setRecentDocuments(List<?> recentDocuments) {
        this.recentDocuments = recentDocuments;
    }

    public List<?> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<?> recentActivities) {
        this.recentActivities = recentActivities;
    }

    public List<?> getUpcomingExpiries() {
        return upcomingExpiries;
    }

    public void setUpcomingExpiries(List<?> upcomingExpiries) {
        this.upcomingExpiries = upcomingExpiries;
    }

    public List<?> getImportantInformation() {
        return importantInformation;
    }

    public void setImportantInformation(List<?> importantInformation) {
        this.importantInformation = importantInformation;
    }

    public Map<String, Long> getDocumentsByCategory() {
        return documentsByCategory;
    }

    public void setDocumentsByCategory(Map<String, Long> documentsByCategory) {
        this.documentsByCategory = documentsByCategory;
    }
}

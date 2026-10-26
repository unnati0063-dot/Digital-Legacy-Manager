package com.digitallegacy.service;

import com.digitallegacy.entity.FamilyMember;
import com.digitallegacy.entity.User;
import com.digitallegacy.exception.ResourceNotFoundException;
import com.digitallegacy.repository.FamilyMemberRepository;
import com.digitallegacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FamilyMemberService {

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<FamilyMember> getFamilyMembersByUserId(Long userId) {
        return familyMemberRepository.findByUserId(userId);
    }

    public FamilyMember getFamilyMemberById(Long id, Long userId) {
        FamilyMember member = familyMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FamilyMember", "id", id));
        if (!member.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("FamilyMember", "id", id);
        }
        return member;
    }

    @Transactional
    public FamilyMember addFamilyMember(Long userId, FamilyMember member) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        member.setUser(user);
        FamilyMember saved = familyMemberRepository.save(member);
        auditLogService.log(userId, user.getUsername(), "ADD_FAMILY_MEMBER", "FAMILY_MEMBER", saved.getId(),
                "Added family member: " + saved.getFullName() + " (" + saved.getRelationship() + ")", null);
        return saved;
    }

    @Transactional
    public FamilyMember updateFamilyMember(Long id, Long userId, FamilyMember memberDetails) {
        FamilyMember member = getFamilyMemberById(id, userId);

        member.setFullName(memberDetails.getFullName());
        member.setRelationship(memberDetails.getRelationship());
        member.setDateOfBirth(memberDetails.getDateOfBirth());
        member.setGender(memberDetails.getGender());
        member.setMobileNumber(memberDetails.getMobileNumber());
        member.setEmail(memberDetails.getEmail());
        member.setAddress(memberDetails.getAddress());
        member.setOccupation(memberDetails.getOccupation());
        member.setEmergencyContact(memberDetails.getEmergencyContact());
        member.setProfilePhoto(memberDetails.getProfilePhoto());
        member.setImportantNotes(memberDetails.getImportantNotes());

        FamilyMember updated = familyMemberRepository.save(member);
        auditLogService.log(userId, member.getUser().getUsername(), "UPDATE_FAMILY_MEMBER", "FAMILY_MEMBER", updated.getId(),
                "Updated family member: " + updated.getFullName(), null);
        return updated;
    }

    @Transactional
    public void deleteFamilyMember(Long id, Long userId) {
        FamilyMember member = getFamilyMemberById(id, userId);
        familyMemberRepository.delete(member);
        auditLogService.log(userId, member.getUser().getUsername(), "DELETE_FAMILY_MEMBER", "FAMILY_MEMBER", id,
                "Deleted family member: " + member.getFullName(), null);
    }
}

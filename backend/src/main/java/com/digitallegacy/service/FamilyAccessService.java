package com.digitallegacy.service;

import com.digitallegacy.entity.FamilyAccess;
import com.digitallegacy.entity.FamilyMember;
import com.digitallegacy.entity.User;
import com.digitallegacy.exception.BadRequestException;
import com.digitallegacy.exception.ResourceNotFoundException;
import com.digitallegacy.repository.FamilyAccessRepository;
import com.digitallegacy.repository.FamilyMemberRepository;
import com.digitallegacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class FamilyAccessService {

    @Autowired
    private FamilyAccessRepository familyAccessRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    public List<FamilyAccess> getAccessListByOwner(Long ownerId) {
        return familyAccessRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
    }

    public List<FamilyAccess> getAccessGrantedToUser(String email) {
        return familyAccessRepository.findByGranteeEmailOrderByCreatedAtDesc(email);
    }

    @Transactional
    public FamilyAccess inviteFamilyMember(Long ownerId, Long familyMemberId, String granteeEmail,
                                           String granteeName, String relationship, String sectionName,
                                           String permissionLevel) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", ownerId));

        FamilyAccess access = new FamilyAccess();
        access.setOwner(owner);
        access.setGranteeEmail(granteeEmail.trim().toLowerCase());
        access.setGranteeName(granteeName);
        access.setRelationship(relationship);
        access.setSectionName(sectionName.toUpperCase());
        access.setPermissionLevel(permissionLevel.toUpperCase());
        access.setInvitationStatus("PENDING");
        access.setInvitationToken(UUID.randomUUID().toString());

        if (familyMemberId != null) {
            FamilyMember member = familyMemberRepository.findById(familyMemberId).orElse(null);
            access.setFamilyMember(member);
        }

        FamilyAccess saved = familyAccessRepository.save(access);

        // Notify owner
        notificationService.createNotification(owner, "Family Invitation Sent",
                "Access invitation sent to " + granteeName + " (" + granteeEmail + ") for " + sectionName + " with " + permissionLevel + " permission.",
                "FAMILY_INVITE", "FAMILY_ACCESS", saved.getId());

        auditLogService.log(ownerId, owner.getUsername(), "INVITE_FAMILY_ACCESS", "FAMILY_ACCESS", saved.getId(),
                "Invited " + granteeEmail + " to access " + sectionName + " [" + permissionLevel + "]", null);

        return saved;
    }

    @Transactional
    public FamilyAccess updatePermission(Long accessId, Long ownerId, String newPermissionLevel, String newSectionName) {
        FamilyAccess access = familyAccessRepository.findById(accessId)
                .orElseThrow(() -> new ResourceNotFoundException("FamilyAccess", "id", accessId));

        if (!access.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only modify permissions for your own vault.");
        }

        if (newPermissionLevel != null) access.setPermissionLevel(newPermissionLevel.toUpperCase());
        if (newSectionName != null) access.setSectionName(newSectionName.toUpperCase());

        FamilyAccess saved = familyAccessRepository.save(access);
        auditLogService.log(ownerId, access.getOwner().getUsername(), "UPDATE_FAMILY_ACCESS", "FAMILY_ACCESS", saved.getId(),
                "Updated permission for " + access.getGranteeEmail() + " to " + saved.getPermissionLevel(), null);
        return saved;
    }

    @Transactional
    public void revokeAccess(Long accessId, Long ownerId) {
        FamilyAccess access = familyAccessRepository.findById(accessId)
                .orElseThrow(() -> new ResourceNotFoundException("FamilyAccess", "id", accessId));

        if (!access.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only revoke permissions for your own vault.");
        }

        access.setInvitationStatus("REVOKED");
        access.setPermissionLevel("NO_ACCESS");
        familyAccessRepository.save(access);

        auditLogService.log(ownerId, access.getOwner().getUsername(), "REVOKE_FAMILY_ACCESS", "FAMILY_ACCESS", accessId,
                "Revoked access for " + access.getGranteeEmail(), null);
    }

    @Transactional
    public void deleteAccess(Long accessId, Long ownerId) {
        FamilyAccess access = familyAccessRepository.findById(accessId)
                .orElseThrow(() -> new ResourceNotFoundException("FamilyAccess", "id", accessId));

        if (!access.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only delete permissions for your own vault.");
        }

        familyAccessRepository.delete(access);
        auditLogService.log(ownerId, access.getOwner().getUsername(), "DELETE_FAMILY_ACCESS", "FAMILY_ACCESS", accessId,
                "Removed access rule for " + access.getGranteeEmail(), null);
    }

    @Transactional
    public FamilyAccess acceptInvitation(String token) {
        FamilyAccess access = familyAccessRepository.findByInvitationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired invitation token."));

        access.setInvitationStatus("ACCEPTED");
        access.setInvitationToken(null);
        return familyAccessRepository.save(access);
    }
}

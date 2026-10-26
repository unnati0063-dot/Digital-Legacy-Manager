package com.digitallegacy.service;

import com.digitallegacy.entity.FamilyMember;
import com.digitallegacy.entity.MedicalInfo;
import com.digitallegacy.entity.User;
import com.digitallegacy.exception.ResourceNotFoundException;
import com.digitallegacy.repository.FamilyMemberRepository;
import com.digitallegacy.repository.MedicalInfoRepository;
import com.digitallegacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicalService {

    @Autowired
    private MedicalInfoRepository medicalInfoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<MedicalInfo> getMedicalInfoByUserId(Long userId) {
        return medicalInfoRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public MedicalInfo getMedicalInfoById(Long id, Long userId) {
        MedicalInfo info = medicalInfoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalInfo", "id", id));
        if (!info.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("MedicalInfo", "id", id);
        }
        return info;
    }

    @Transactional
    public MedicalInfo addMedicalInfo(Long userId, MedicalInfo info, Long familyMemberId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        info.setUser(user);
        if (familyMemberId != null) {
            FamilyMember member = familyMemberRepository.findById(familyMemberId).orElse(null);
            info.setFamilyMember(member);
        }

        MedicalInfo saved = medicalInfoRepository.save(info);
        auditLogService.log(userId, user.getUsername(), "ADD_MEDICAL_INFO", "MEDICAL", saved.getId(),
                "Added medical information for: " + saved.getPersonName(), null);
        return saved;
    }

    @Transactional
    public MedicalInfo updateMedicalInfo(Long id, Long userId, MedicalInfo updated, Long familyMemberId) {
        MedicalInfo existing = getMedicalInfoById(id, userId);

        existing.setPersonName(updated.getPersonName());
        existing.setBloodGroup(updated.getBloodGroup());
        existing.setAllergies(updated.getAllergies());
        existing.setEmergencyContactName(updated.getEmergencyContactName());
        existing.setEmergencyContactPhone(updated.getEmergencyContactPhone());
        existing.setDoctorName(updated.getDoctorName());
        existing.setDoctorContact(updated.getDoctorContact());
        existing.setImportantMedicalNotes(updated.getImportantMedicalNotes());
        existing.setEmergencyInstructions(updated.getEmergencyInstructions());

        if (familyMemberId != null) {
            FamilyMember member = familyMemberRepository.findById(familyMemberId).orElse(null);
            existing.setFamilyMember(member);
        } else {
            existing.setFamilyMember(null);
        }

        MedicalInfo saved = medicalInfoRepository.save(existing);
        auditLogService.log(userId, existing.getUser().getUsername(), "UPDATE_MEDICAL_INFO", "MEDICAL", saved.getId(),
                "Updated medical information for: " + saved.getPersonName(), null);
        return saved;
    }

    @Transactional
    public void deleteMedicalInfo(Long id, Long userId) {
        MedicalInfo existing = getMedicalInfoById(id, userId);
        medicalInfoRepository.delete(existing);
        auditLogService.log(userId, existing.getUser().getUsername(), "DELETE_MEDICAL_INFO", "MEDICAL", id,
                "Deleted medical record for: " + existing.getPersonName(), null);
    }
}

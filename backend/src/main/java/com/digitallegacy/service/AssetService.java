package com.digitallegacy.service;

import com.digitallegacy.entity.Asset;
import com.digitallegacy.entity.FamilyMember;
import com.digitallegacy.entity.User;
import com.digitallegacy.exception.ResourceNotFoundException;
import com.digitallegacy.repository.AssetRepository;
import com.digitallegacy.repository.FamilyMemberRepository;
import com.digitallegacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AuditLogService auditLogService;

    public List<Asset> getAssetsByUserId(Long userId) {
        return assetRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Asset getAssetById(Long id, Long userId) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", id));
        if (!asset.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Asset", "id", id);
        }
        return asset;
    }

    @Transactional
    public Asset addAsset(Long userId, String assetName, String assetType, String ownerName,
                          Long familyMemberId, String description, String location,
                          BigDecimal estimatedValue, String documentReference, String notes,
                          MultipartFile attachment) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Asset asset = new Asset();
        asset.setUser(user);
        asset.setAssetName(assetName);
        asset.setAssetType(assetType);
        asset.setOwnerName(ownerName);
        asset.setDescription(description);
        asset.setLocation(location);
        asset.setEstimatedValue(estimatedValue);
        asset.setDocumentReference(documentReference);
        asset.setNotes(notes);

        if (familyMemberId != null) {
            FamilyMember member = familyMemberRepository.findById(familyMemberId).orElse(null);
            asset.setFamilyMember(member);
        }

        if (attachment != null && !attachment.isEmpty()) {
            String storedPath = fileStorageService.storeFile(attachment);
            asset.setAttachmentPath(storedPath);
        }

        Asset saved = assetRepository.save(asset);
        auditLogService.log(userId, user.getUsername(), "ADD_ASSET", "ASSET", saved.getId(),
                "Added asset: " + saved.getAssetName() + " (" + saved.getAssetType() + ")", null);
        return saved;
    }

    @Transactional
    public Asset updateAsset(Long id, Long userId, Asset assetDetails, Long familyMemberId) {
        Asset asset = getAssetById(id, userId);

        asset.setAssetName(assetDetails.getAssetName());
        asset.setAssetType(assetDetails.getAssetType());
        asset.setOwnerName(assetDetails.getOwnerName());
        asset.setDescription(assetDetails.getDescription());
        asset.setLocation(assetDetails.getLocation());
        asset.setEstimatedValue(assetDetails.getEstimatedValue());
        asset.setDocumentReference(assetDetails.getDocumentReference());
        asset.setNotes(assetDetails.getNotes());

        if (familyMemberId != null) {
            FamilyMember member = familyMemberRepository.findById(familyMemberId).orElse(null);
            asset.setFamilyMember(member);
        } else {
            asset.setFamilyMember(null);
        }

        Asset saved = assetRepository.save(asset);
        auditLogService.log(userId, asset.getUser().getUsername(), "UPDATE_ASSET", "ASSET", saved.getId(),
                "Updated asset: " + saved.getAssetName(), null);
        return saved;
    }

    @Transactional
    public void deleteAsset(Long id, Long userId) {
        Asset asset = getAssetById(id, userId);
        if (asset.getAttachmentPath() != null) {
            fileStorageService.deleteFile(asset.getAttachmentPath());
        }
        assetRepository.delete(asset);
        auditLogService.log(userId, asset.getUser().getUsername(), "DELETE_ASSET", "ASSET", id,
                "Deleted asset: " + asset.getAssetName(), null);
    }
}

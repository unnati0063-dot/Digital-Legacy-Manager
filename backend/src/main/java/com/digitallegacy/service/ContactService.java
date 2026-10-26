package com.digitallegacy.service;

import com.digitallegacy.entity.Contact;
import com.digitallegacy.entity.User;
import com.digitallegacy.exception.ResourceNotFoundException;
import com.digitallegacy.repository.ContactRepository;
import com.digitallegacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<Contact> getContactsByUserId(Long userId) {
        return contactRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Contact getContactById(Long id, Long userId) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", id));
        if (!contact.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Contact", "id", id);
        }
        return contact;
    }

    @Transactional
    public Contact addContact(Long userId, Contact contact) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        contact.setUser(user);
        Contact saved = contactRepository.save(contact);
        auditLogService.log(userId, user.getUsername(), "ADD_CONTACT", "CONTACT", saved.getId(),
                "Added contact: " + saved.getName() + " (" + saved.getContactType() + ")", null);
        return saved;
    }

    @Transactional
    public Contact updateContact(Long id, Long userId, Contact updated) {
        Contact existing = getContactById(id, userId);

        existing.setName(updated.getName());
        existing.setRelationship(updated.getRelationship());
        existing.setContactType(updated.getContactType());
        existing.setContactNumber(updated.getContactNumber());
        existing.setEmail(updated.getEmail());
        existing.setAddress(updated.getAddress());
        existing.setNotes(updated.getNotes());

        Contact saved = contactRepository.save(existing);
        auditLogService.log(userId, existing.getUser().getUsername(), "UPDATE_CONTACT", "CONTACT", saved.getId(),
                "Updated contact: " + saved.getName(), null);
        return saved;
    }

    @Transactional
    public void deleteContact(Long id, Long userId) {
        Contact existing = getContactById(id, userId);
        contactRepository.delete(existing);
        auditLogService.log(userId, existing.getUser().getUsername(), "DELETE_CONTACT", "CONTACT", id,
                "Deleted contact: " + existing.getName(), null);
    }
}

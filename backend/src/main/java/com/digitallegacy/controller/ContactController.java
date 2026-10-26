package com.digitallegacy.controller;

import com.digitallegacy.entity.Contact;
import com.digitallegacy.payload.ApiResponse;
import com.digitallegacy.security.UserPrincipal;
import com.digitallegacy.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ContactController {

    @Autowired
    private ContactService contactService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Contact>>> getContacts(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Contact> list = contactService.getContactsByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Contacts retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Contact>> getContact(@AuthenticationPrincipal UserPrincipal currentUser,
                                                           @PathVariable Long id) {
        Contact contact = contactService.getContactById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Contact retrieved", contact));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Contact>> addContact(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Contact contact) {

        Contact created = contactService.addContact(currentUser.getId(), contact);
        return ResponseEntity.ok(ApiResponse.success("Contact added successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Contact>> updateContact(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @RequestBody Contact contact) {

        Contact updated = contactService.updateContact(id, currentUser.getId(), contact);
        return ResponseEntity.ok(ApiResponse.success("Contact updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContact(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        contactService.deleteContact(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Contact deleted successfully"));
    }
}

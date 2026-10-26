package com.digitallegacy.config;

import com.digitallegacy.entity.*;
import com.digitallegacy.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentCategoryRepository categoryRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private FinancialInfoRepository financialInfoRepository;

    @Autowired
    private InsuranceRepository insuranceRepository;

    @Autowired
    private MedicalInfoRepository medicalInfoRepository;

    @Autowired
    private DigitalAccountRepository digitalAccountRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private LegacyInstructionRepository legacyInstructionRepository;

    @Autowired
    private ImportantInfoRepository importantInfoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Seed categories if empty
        if (categoryRepository.count() == 0) {
            categoryRepository.save(new DocumentCategory("Government Identification", "GOVERNMENT", "Official government IDs and passports"));
            categoryRepository.save(new DocumentCategory("Personal Documents", "PERSONAL", "Education degrees, resumes, experience certificates"));
            categoryRepository.save(new DocumentCategory("Property & Real Estate", "PROPERTY", "Title deeds, registry, tax papers"));
            categoryRepository.save(new DocumentCategory("Financial & Tax Records", "FINANCIAL", "Bank passbooks, tax returns, certificates"));
            categoryRepository.save(new DocumentCategory("Insurance Policies", "INSURANCE", "Term, health, and vehicle policies"));
            categoryRepository.save(new DocumentCategory("Medical Records", "MEDICAL", "Prescriptions, vaccination, clinical history"));
        }

        // Create Admin user if not exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@digitallegacy.com");
            admin.setPassword(passwordEncoder.encode("Password@123"));
            admin.setFullName("System Administrator");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setPhone("+91 9876543200");
            admin.setCity("Mumbai");
            admin.setState("Maharashtra");
            admin.setCountry("India");
            userRepository.save(admin);
        }

        // Create Demo User if not exists
        if (!userRepository.existsByUsername("john_doe")) {
            User user = new User();
            user.setUsername("john_doe");
            user.setEmail("john@example.com");
            user.setPassword(passwordEncoder.encode("Password@123"));
            user.setFullName("Johnathan Doe");
            user.setRole(Role.ROLE_USER);
            user.setPhone("+91 9876543210");
            user.setDateOfBirth(LocalDate.of(1988, 5, 14));
            user.setGender("Male");
            user.setAddress("42 Palm Meadows, Indiranagar");
            user.setCity("Bengaluru");
            user.setState("Karnataka");
            user.setCountry("India");
            user.setEmergencyContact("+91 9876543211 (Jane Doe - Spouse)");
            userRepository.save(user);

            // Add Family Members for John
            FamilyMember father = new FamilyMember();
            father.setUser(user);
            father.setFullName("Robert Doe");
            father.setRelationship("Father");
            father.setDateOfBirth(LocalDate.of(1958, 2, 10));
            father.setGender("Male");
            father.setMobileNumber("+91 9811122233");
            father.setEmail("robert.doe@example.com");
            father.setOccupation("Retired Bank Manager");
            father.setEmergencyContact("+91 9876543210");
            father.setImportantNotes("Holds joint locker with mother in SBI branch.");
            familyMemberRepository.save(father);

            FamilyMember spouse = new FamilyMember();
            spouse.setUser(user);
            spouse.setFullName("Jane Doe");
            spouse.setRelationship("Wife");
            spouse.setDateOfBirth(LocalDate.of(1990, 8, 22));
            spouse.setGender("Female");
            spouse.setMobileNumber("+91 9876543211");
            spouse.setEmail("jane.doe@example.com");
            spouse.setOccupation("Architect");
            spouse.setEmergencyContact("+91 9876543210");
            spouse.setImportantNotes("Primary nominee on life and health policies.");
            familyMemberRepository.save(spouse);

            // Seed Sample Documents
            Document doc1 = new Document();
            doc1.setUser(user);
            doc1.setCategory("GOVERNMENT");
            doc1.setDocumentName("Johnathan Indian Passport");
            doc1.setDocumentType("Passport");
            doc1.setDocumentNumber("Z5982103");
            doc1.setOwnerName("Johnathan Doe");
            doc1.setIssueDate(LocalDate.of(2018, 4, 15));
            doc1.setExpiryDate(LocalDate.now().plusMonths(3)); // Expiring soon!
            doc1.setIssuingAuthority("Ministry of External Affairs");
            doc1.setDescription("Regular 36-page passport for overseas travel.");
            documentRepository.save(doc1);

            Document doc2 = new Document();
            doc2.setUser(user);
            doc2.setFamilyMember(father);
            doc2.setCategory("GOVERNMENT");
            doc2.setDocumentName("Father Aadhaar Card");
            doc2.setDocumentType("Aadhaar Card");
            doc2.setDocumentNumber("XXXX-XXXX-8921");
            doc2.setOwnerName("Robert Doe");
            doc2.setIssueDate(LocalDate.of(2014, 11, 20));
            doc2.setIssuingAuthority("UIDAI");
            doc2.setDescription("Aadhaar card linked with pension account.");
            documentRepository.save(doc2);

            Document doc3 = new Document();
            doc3.setUser(user);
            doc3.setCategory("PERSONAL");
            doc3.setDocumentName("Bachelor of Engineering Degree");
            doc3.setDocumentType("Educational Certificates");
            doc3.setDocumentNumber("DEG-CS-2010");
            doc3.setOwnerName("Johnathan Doe");
            doc3.setIssueDate(LocalDate.of(2010, 7, 10));
            doc3.setIssuingAuthority("State Technological University");
            doc3.setDescription("Computer Science and Engineering 4-year degree.");
            documentRepository.save(doc3);

            // Seed Asset
            Asset asset1 = new Asset();
            asset1.setUser(user);
            asset1.setAssetName("Palm Meadows Villa");
            asset1.setAssetType("House");
            asset1.setOwnerName("Johnathan & Jane Doe");
            asset1.setLocation("Indiranagar, Bengaluru");
            asset1.setEstimatedValue(new BigDecimal("18500000.00"));
            asset1.setDocumentReference("Sale Deed Vol. 488 / Page 211");
            asset1.setNotes("Mortgage completely paid off in 2024. Original deed in physical locker.");
            assetRepository.save(asset1);

            // Seed Financial Info
            FinancialInfo fin1 = new FinancialInfo();
            fin1.setUser(user);
            fin1.setBankName("HDFC Bank");
            fin1.setAccountType("Savings");
            fin1.setAccountHolder("Johnathan Doe");
            fin1.setLastFourDigits("4589");
            fin1.setBranch("Indiranagar 100ft Road");
            fin1.setIfsc("HDFC0001234");
            fin1.setImportantNotes("Salary account with active sweep-in fixed deposit.");
            financialInfoRepository.save(fin1);

            // Seed Insurance
            Insurance ins1 = new Insurance();
            ins1.setUser(user);
            ins1.setInsuranceProvider("HDFC ERGO");
            ins1.setPolicyType("Health Insurance");
            ins1.setPolicyNumber("POL-HLT-99201");
            ins1.setPolicyHolder("Johnathan Doe");
            ins1.setNominee("Jane Doe");
            ins1.setStartDate(LocalDate.of(2023, 1, 1));
            ins1.setExpiryDate(LocalDate.now().plusMonths(1)); // Expiring soon!
            ins1.setPremiumAmount(new BigDecimal("24500.00"));
            ins1.setPremiumFrequency("Annually");
            ins1.setNotes("Family floater cover ₹25,00,000 including cashless hospital network.");
            insuranceRepository.save(ins1);

            // Seed Medical Info
            MedicalInfo med1 = new MedicalInfo();
            med1.setUser(user);
            med1.setPersonName("Johnathan Doe");
            med1.setBloodGroup("O+");
            med1.setAllergies("Penicillin, Shellfish");
            med1.setEmergencyContactName("Jane Doe");
            med1.setEmergencyContactPhone("+91 9876543211");
            med1.setDoctorName("Dr. Arvind Sharma");
            med1.setDoctorContact("+91 9845012345");
            med1.setImportantMedicalNotes("Regular annual cardiology screening recommended.");
            med1.setEmergencyInstructions("In case of acute allergic reaction, administer Epipen stored in bedside drawer.");
            medicalInfoRepository.save(med1);

            // Seed Digital Account
            DigitalAccount dig1 = new DigitalAccount();
            dig1.setUser(user);
            dig1.setAccountCategory("Cloud Storage");
            dig1.setServiceName("Google Workspace & Drive");
            dig1.setUsernameOrEmail("john.workspace@gmail.com");
            dig1.setWebsiteUrl("https://drive.google.com");
            dig1.setAccountStatus("Active");
            dig1.setRecoveryInfo("Recovery mobile: +91 9876543210; backup code envelope in house safe.");
            dig1.setInstructions("Contains family photo albums dating back to 2012 and digital tax records.");
            digitalAccountRepository.save(dig1);

            // Seed Important Contact
            Contact c1 = new Contact();
            c1.setUser(user);
            c1.setName("Adv. Rajesh Kulkarni");
            c1.setRelationship("Family Legal Advisor");
            c1.setContactType("Lawyer");
            c1.setContactNumber("+91 9820054321");
            c1.setEmail("rajesh.kulkarni@legaladvisors.in");
            c1.setAddress("Chamber 402, High Court Complex");
            c1.setNotes("Has registered copy of family will and property power of attorney.");
            contactRepository.save(c1);

            // Seed Legacy Instructions
            LegacyInstruction leg1 = new LegacyInstruction();
            leg1.setUser(user);
            leg1.setTitle("Physical Bank Locker & Vault Key Directives");
            leg1.setCategory("Important Documents Location");
            leg1.setInstructionText("Original property papers, gold ornaments, and emergency bearer bonds are in SBI Indiranagar Locker #244. Both keys are in the master bedroom study safe (Code: 8492).");
            leg1.setPriority("High");
            legacyInstructionRepository.save(leg1);

            // Seed Important Info
            ImportantInfo info1 = new ImportantInfo();
            info1.setUser(user);
            info1.setTitle("Family Emergency Protocol & Primary Doctors");
            info1.setCategory("Emergency Instructions");
            info1.setContent("In medical emergencies: Manipal Hospital Old Airport Road is the primary preferred facility under our cashless health card (Card #HLT-99201). Inform Dr. Arvind Sharma immediately.");
            info1.setImportanceLevel("High");
            importantInfoRepository.save(info1);
        }
    }
}

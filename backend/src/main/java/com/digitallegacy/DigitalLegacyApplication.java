package com.digitallegacy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DigitalLegacyApplication {

    public static void main(String[] args) {
        SpringApplication.run(DigitalLegacyApplication.class, args);
    }
}

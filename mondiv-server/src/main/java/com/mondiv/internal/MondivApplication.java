package com.mondiv.internal;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MondivApplication {
    
    static {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();
        
        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });
    }
    
    public static void main(String[] args) {
        SpringApplication.run(MondivApplication.class, args);
    }
    
}

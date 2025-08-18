package com.mondiv.internal;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication(scanBasePackages = "com.mondiv")
@ConfigurationPropertiesScan(basePackages = "com.mondiv")
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
        Thread.currentThread().setName("Mondiv-Main");
        SpringApplication.run(MondivApplication.class, args);
    }
    
}

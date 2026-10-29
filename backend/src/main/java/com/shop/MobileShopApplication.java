package com.shop;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MobileShopApplication {

    static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        System.setProperty(
                "SERVER_PORT",
                dotenv.get("SERVER_PORT", "8080")
        );

        System.setProperty("DB_URL", dotenv.get("DB_URL",
                "jdbc:mysql://localhost:3306/mobile_shop"));

        System.setProperty("DB_USERNAME",
                dotenv.get("DB_USERNAME", "root"));

        System.setProperty("DB_PASSWORD",
                dotenv.get("DB_PASSWORD", ""));

        SpringApplication.run(MobileShopApplication.class, args);
    }
}
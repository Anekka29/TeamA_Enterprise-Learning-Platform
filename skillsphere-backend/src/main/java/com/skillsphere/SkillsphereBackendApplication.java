package com.skillsphere;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class SkillsphereBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SkillsphereBackendApplication.class, args);
	}

	@Bean
	CommandLineRunner alterUserTableColumns(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN college VARCHAR(255) NULL");
				jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN department VARCHAR(255) NULL");
				jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN year VARCHAR(255) NULL");
				jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN phoneNumber VARCHAR(255) NULL");
				System.out.println("Successfully altered users table columns to allow nulls");
			} catch (Exception e) {
				System.out.println("Columns might already be nullable: " + e.getMessage());
			}
		};
	}

}

package com.thanhpham.product_idea_validator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ProductIdeaValidatorApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProductIdeaValidatorApplication.class, args);
	}

}

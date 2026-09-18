package com.springboot.restapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;


@SpringBootApplication(
	    exclude = {DataSourceAutoConfiguration.class}
	)

public class SprigBootRestApiProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(SprigBootRestApiProjectApplication.class, args);
	}

}

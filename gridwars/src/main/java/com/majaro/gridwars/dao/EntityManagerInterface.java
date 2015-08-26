package com.majaro.gridwars.dao;

import com.majaro.gridwars.entities.User;

public interface EntityManagerInterface {
	int Authenticate(String usernameAttempt, String passwordAttempt);
}

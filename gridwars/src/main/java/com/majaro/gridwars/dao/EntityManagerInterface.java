package com.majaro.gridwars.dao;

import com.majaro.gridwars.entities.User;

public interface EntityManagerInterface {
	User authenticate(String usernameAttempt, String passwordAttempt);
	int register(String newUsername, String newPassword);
}

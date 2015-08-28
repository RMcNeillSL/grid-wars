package com.majaro.gridwars.api;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;

public class SocketService {
	
	@OnEvent("helloworld")
	public void onTestSocket(SocketIOClient client) {
		
	}
	
	@OnConnect
	public void onConnectHandler(SocketIOClient client) {
		System.out.println("A user has connected.");
	}
	
	@OnDisconnect
	public void onDisconnectHandler(SocketIOClient client) {
		System.out.println("A user has disconnected.");
	}
}

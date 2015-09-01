package com.majaro.gridwars.api;

import javax.websocket.OnMessage;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.BroadcastOperations;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.majaro.gridwars.apiobjects.MessageRequest;

public class SocketService {

	private BroadcastOperations broadcast;

	public SocketService (BroadcastOperations broadcast) {
		this.broadcast = broadcast;
	}

	@OnEvent("sendMessage")
    public void onSomeEventHandler(SocketIOClient client, MessageRequest data, AckRequest ackRequest) {
		String user = data.getUser();
		String message = data.getMessage();
        System.out.println(user + ": " + message);
        this.broadcast.sendEvent("message", data);
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

package com.majaro.gridwars.api;

import javax.websocket.OnMessage;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.majaro.gridwars.apiobjects.TestRequest;

public class SocketService {

	@OnEvent("test")
    public void onSomeEventHandler(SocketIOClient client, TestRequest data, AckRequest ackRequest) {
        System.out.println(data.getHello());
        //client.sendEvent("testMsg", data);
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

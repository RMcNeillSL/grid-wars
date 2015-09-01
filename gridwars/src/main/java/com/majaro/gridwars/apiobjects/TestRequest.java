package com.majaro.gridwars.apiobjects;

public class TestRequest {
	private String hello;
	
	public TestRequest() { }
	
	public TestRequest(String hello) {
		super();
		this.hello = hello;
	}
	
	public String getHello() {
		return hello;
	}
	
	public void setHello(String hello) {
		this.hello = hello;
	}
}

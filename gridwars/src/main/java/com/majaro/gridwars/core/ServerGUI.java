package com.majaro.gridwars.core;

import java.awt.Dimension;
import java.awt.Toolkit;

import javax.swing.JFrame;

public class ServerGUI {
	
	// GUI components
	private JFrame frame = null;
	
	// Constructor
	public ServerGUI() {
		
		// Create basic frame
		this.frame = new JFrame("Gridwars Server");
		this.frame.setSize(200, 200);
		
		// Center frame
		Dimension dimension = Toolkit.getDefaultToolkit().getScreenSize();
		
		// Set jframe to display
		this.frame.setVisible(true);
		
	}

}

package com.majaro.gridwars.core;

import java.awt.Dimension;
import java.awt.Insets;
import java.awt.Toolkit;
import java.sql.Date;
import java.text.DateFormat;
import java.text.SimpleDateFormat;

import javax.swing.JFrame;
import javax.swing.JTextArea;

public class ServerGUI {
	
	// GUI components
	private static JFrame frame = null;
	private static JTextArea logTextArea = null;
	
	// Log message enum
	public enum E_LogLevel { LOW, MEDIUM, HIGH };
	
	// Constructor
	public ServerGUI() {
		
		// Create basic frame
		this.frame = new JFrame("Gridwars Server");
		this.frame.setSize(800, 600);
		this.frame.setLocationRelativeTo(null);
		this.frame.setResizable(false);
		
		// Create log text area
		this.logTextArea = new JTextArea();
		this.logTextArea.setEditable(false);
		this.logTextArea.setMargin(new Insets(10,10,10,10));
		this.frame.add(this.logTextArea);
		
		// Set jframe to display
		this.frame.setVisible(true);
		
	}
	
	// Logging methods
	public static void logMessage(ServerGUI.E_LogLevel logLevel, String message) {
		
		// Add time stamp
        DateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");
        Date date = new Date(0);    
        
        // Add new line to top of text area
        try { logTextArea.getDocument().insertString(0, dateFormat.format(date) + "      " + message + "\n", null); } catch (Exception e1) { }
        
        // Add log to console also
        System.out.println(message);
	}

}

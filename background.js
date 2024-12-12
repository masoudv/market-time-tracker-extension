// background.js

// Log when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    console.log("Market Time Tracker extension installed!");
  });
  
  // Example of periodic updates
  setInterval(() => {
    console.log("Background script is running...");
    // Add API fetching or notification logic here
  }, 60000); // Runs every 60 seconds
  
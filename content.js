// Check if the user has granted permission
chrome.storage.sync.get(["marketOverlayEnabled"], (result) => {
    if (result.marketOverlayEnabled === undefined || !result.marketOverlayEnabled) {
      askForPermission(); // Ask for permission if not granted
    } else {
      injectMarketOverlay(); // Inject the market overlay if enabled
    }
  });
  
  // Function to ask for user permission
  function askForPermission() {
    const permissionDiv = document.createElement("div");
    permissionDiv.id = "permission-popup";
    permissionDiv.style.position = "fixed";
    permissionDiv.style.top = "0";
    permissionDiv.style.left = "0";
    permissionDiv.style.width = "100%";
    permissionDiv.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    permissionDiv.style.color = "white";
    permissionDiv.style.textAlign = "center";
    permissionDiv.style.padding = "15px";
    permissionDiv.style.zIndex = "99999";
  
    permissionDiv.innerHTML = `
      <div style="font-size: 16px; margin-bottom: 10px; direction:ltr !important;">
        🤔 Do you want to enable Market Timers on this page?
      </div>
      <button id="allow-overlay">👍 Allow</button>
      <button id="deny-overlay">👎 Deny</button>
    `;
  
    document.body.appendChild(permissionDiv);
  
    document.getElementById("allow-overlay").onclick = () => {
      chrome.storage.sync.set({ marketOverlayEnabled: true });
      permissionDiv.remove();
      injectMarketOverlay();
    };
  
    document.getElementById("deny-overlay").onclick = () => {
      chrome.storage.sync.set({ marketOverlayEnabled: false });
      permissionDiv.remove();
    };
  }
  function injectMarketOverlay() {
    // Create a container for the Shadow DOM
    const overlayContainer = document.createElement("div");
    overlayContainer.id = "market-overlay-container";
    overlayContainer.style.position = "fixed";
    overlayContainer.style.top = "0";
    overlayContainer.style.left = "0";
    overlayContainer.style.width = "100%";
    overlayContainer.style.zIndex = "9999";
  
    // Attach Shadow DOM
    const shadowRoot = overlayContainer.attachShadow({ mode: "open" });
  
    // Add styles and content to the Shadow DOM
    shadowRoot.innerHTML = `
      <style>
        #market-overlay {
          direction:ltr !important;
          font-family:Arial, sans-serif !important;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background-color: rgba(255, 255, 255, 0.95);
          color: #333;
          z-index: 9999;
          padding: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.5s ease, opacity 0.5s ease;
        }
  
        #market-overlay.hidden {
          transform: translateY(-100%);
          opacity: 0;
        }
  
        #market-overlay button {
          background: #ffffff;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          color: white;
          border: none;
          border-radius: 0 0 5px 5px;
            width: 30px;
            height: 30px;
            top:0;
          padding: 5px;
          cursor: pointer;
          margin-left: 5px;

        }
  
        #market-overlay button:hover {
          opacity: 0.8;
        }
  
        #market-timers {
          flex-grow: 1;
          display: flex;
          justify-content: space-evenly;
        }
  
        #market-timers > div {
          padding: 5px 10px;
          background-color: #f5f5f5;
          border: 1px solid #ccc;
          border-radius: 5px;
          margin: 0 5px;
          text-align: center;
        }
  
        #toggle-button {
            position: fixed;
            top: 0;
            right: 10px;
            z-index: 10000;
            color: #ffffff;
            border: none;
            border-radius: 0 0 5px 5px;
            width: 30px;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            font-size: 16px;
            background: #ffffff;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        #timer-actions{
            top: 0;
            position: fixed;
            display: flex;
            justify-content: center;
            align-items: center;
            right: 10px;
    }
      </style>
      <div id="market-overlay">
        <div id="market-timers">
          <!-- Market timers will be added dynamically -->
        </div>
        <div id="timer-actions">
          <button id="close-market-overlay">❌</button>
        </div>
      </div>
      <button id="toggle-button" style="display: none;">⬇️</button>
    `;
  
    document.body.appendChild(overlayContainer);
  
    const overlay = shadowRoot.getElementById("market-overlay");
    const toggleButton = shadowRoot.getElementById("toggle-button");
    const closeButton = shadowRoot.getElementById("close-market-overlay");
  
    // Minimize/Maximize logic
    toggleButton.onclick = () => {
      if (overlay.classList.contains("hidden")) {
        overlay.classList.remove("hidden");
        toggleButton.style.display = "none"; // Hide toggle button
      }
    };
    closeButton.onclick = () => {
      overlayContainer.remove();
      chrome.storage.sync.set({ marketOverlayEnabled: false });
    };
    const minimizeButton = document.createElement("button");
    minimizeButton.textContent = "⬆️";
    minimizeButton.onclick = () => {
      overlay.classList.add("hidden");
      toggleButton.style.display = "block"; // Show toggle button
    };
    closeButton.before(minimizeButton);
    // Populate timers
    updateMarketTimers(shadowRoot);
  }
  
  function updateMarketTimers(shadowRoot) {
    const markets = [
      { name: "New York", open: { hour: 9, minute: 0 }, close: { hour: 16, minute: 0 }, timezone: "America/New_York" },
      { name: "London", open: { hour: 8, minute: 0 }, close: { hour: 17, minute: 0 }, timezone: "Europe/London" },
      { name: "Tokyo", open: { hour: 9, minute: 0 }, close: { hour: 15, minute: 0 }, timezone: "Asia/Tokyo" },
      { name: "Sydney", open: { hour: 10, minute: 0 }, close: { hour: 16, minute: 0 }, timezone: "Australia/Sydney" }
    ];
  
    const timersContainer = shadowRoot.getElementById("market-timers");
    timersContainer.innerHTML = ""; // Clear previous timers
  
    markets.forEach(market => {
      const timerElement = document.createElement("div");
      timerElement.classList.add("market-timer");
      timerElement.textContent = `${market.name}: Loading...`;
      timersContainer.appendChild(timerElement);
  
      setInterval(() => {
        const currentTime = new Date().toLocaleString("en-US", { timeZone: market.timezone });
        const timeUntilClose = calculateTimeUntil(currentTime, market.close);
        const timeUntilOpen = calculateTimeUntil(currentTime, market.open);
  
        if (isMarketOpen(currentTime, market.open, market.close)) {
          // Market is open
          const minutesLeft = Math.floor(timeUntilClose / 1000 / 60);
  
          if (minutesLeft > 39) {
            // Green phase
            timerElement.style.border = "2px solid lightgreen";
            timerElement.style.color = "green";
          } else if (minutesLeft >= 20 && minutesLeft <= 39) {
            // Yellow phase
            timerElement.style.border = "2px solid lightyellow";
            timerElement.style.color = "orange";
          } else if (minutesLeft < 20) {
            // Red phase
            timerElement.style.border = "2px solid lightcoral";
            timerElement.style.color = "red";
          }
  
          timerElement.textContent = `${market.name}: Closes in ${formatCountdown(timeUntilClose)}`;
        } else {
          // Market is closed
          timerElement.style.border = "2px solid gray";
          timerElement.style.color = "gray";
          timerElement.textContent = `${market.name}: Opens in ${formatCountdown(timeUntilOpen)}`;
        }
      }, 1000);
    });
  
    function calculateTimeUntil(currentTime, targetTime) {
      const now = new Date(currentTime);
      const target = new Date(currentTime);
      target.setHours(targetTime.hour, targetTime.minute, 0, 0);
  
      if (now > target) {
        target.setDate(target.getDate() + 1); // Move to the next day if time has passed
      }
  
      return target - now;
    }
  
    function isMarketOpen(currentTime, openTime, closeTime) {
      const now = new Date(currentTime);
      const open = new Date(currentTime);
      open.setHours(openTime.hour, openTime.minute, 0, 0);
  
      const close = new Date(currentTime);
      close.setHours(closeTime.hour, closeTime.minute, 0, 0);
  
      return now >= open && now < close;
    }
  
    function formatCountdown(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours}h ${minutes}m ${seconds}s`;
    }
  }
  
  
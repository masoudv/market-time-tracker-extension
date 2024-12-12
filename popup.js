document.addEventListener("DOMContentLoaded", () => {
    const markets = [
      { name: "New York", open: { hour: 9, minute: 0 }, close: { hour: 16, minute: 0 }, timezone: "America/New_York" },
      { name: "London", open: { hour: 8, minute: 0 }, close: { hour: 17, minute: 0 }, timezone: "Europe/London" },
      { name: "Tokyo", open: { hour: 9, minute: 0 }, close: { hour: 15, minute: 0 }, timezone: "Asia/Tokyo" },
      { name: "Sydney", open: { hour: 10, minute: 0 }, close: { hour: 16, minute: 0 }, timezone: "Australia/Sydney" }
    ];
  
    const marketsContainer = document.getElementById("markets");
  
    markets.forEach(market => {
      const marketElement = document.createElement("div");
      marketElement.classList.add("market");
  
      const marketName = document.createElement("h3");
      marketName.textContent = market.name;
  
      const timer = document.createElement("p");
      timer.textContent = "Calculating...";
  
      marketElement.appendChild(marketName);
      marketElement.appendChild(timer);
      marketsContainer.appendChild(marketElement);
  
      // Update timer every second
      setInterval(() => {
        const currentTime = new Date().toLocaleString("en-US", { timeZone: market.timezone });
        const timeUntilOpen = calculateTimeUntil(currentTime, market.open);
        const timeUntilClose = calculateTimeUntil(currentTime, market.close);
  
        if (isMarketOpen(currentTime, market.open, market.close)) {
          timer.textContent = `Closes in: ${formatCountdown(timeUntilClose)}`;
          marketElement.classList.add("open");
          marketElement.classList.remove("closed");
        } else {
          timer.textContent = `Opens in: ${formatCountdown(timeUntilOpen)}`;
          marketElement.classList.add("closed");
          marketElement.classList.remove("open");
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
  });
  
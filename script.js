// Check if Telegram Web App is available
const telegram = window.Telegram.WebApp;

// Initialize Telegram Web App if available
let telegramId = null;
if (telegram) {
  telegram.expand();
  telegramId = telegram.initDataUnsafe?.user?.id; // Get Telegram user ID from WebApp data
  console.log("Telegram user ID:", telegramId);

  // Set up the main button
  telegram.MainButton.text = "Share Progress";
  telegram.MainButton.setParams({ color: "#28a745", text_color: "#ffffff" });
}

let startTime = null;
let timerInterval = null;

const timerDisplay = document.getElementById("timer-display");
const restartBtn = document.getElementById("restart-btn");

// Restore state on load
function restoreState() {
  const savedStartTime = localStorage.getItem("quitTrackerStartTime");
  const currentTime = Date.now();

  if (savedStartTime && !isNaN(savedStartTime) && savedStartTime < currentTime) {
    startTime = parseInt(savedStartTime, 10);
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  } else {
    startTimer(); // Automatically start timer on load
  }
}

// Start timer
function startTimer() {
  startTime = Date.now();
  localStorage.setItem("quitTrackerStartTime", startTime);
  timerInterval = setInterval(updateTimer, 1000);
}

// Restart timer with confirmation
function restartTimer() {
  const confirmReset = confirm("Are you sure you want to restart the timer?");
  if (confirmReset) {
    clearInterval(timerInterval);
    startTimer();
  }
}

// Update timer
function updateTimer() {
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(elapsedTime / 3600);
  const minutes = Math.floor((elapsedTime % 3600) / 60);
  const seconds = elapsedTime % 60;

  timerDisplay.innerHTML = `Time Since Quit: <span>${hours}h ${minutes}m ${seconds}s</span>`;

  // Send elapsed time to the server
  if (telegramId) {
    sendMilestoneUpdate(telegramId, elapsedTime);
  }
}

// Send milestone updates to the server
async function sendMilestoneUpdate(telegramId, elapsedTime) {
  try {
    const response = await fetch("https://a433-188-132-129-196.ngrok-free.app/update-milestone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        telegramId: telegramId,
        elapsedTime: elapsedTime,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Milestone update successful:", data);
  } catch (error) {
    console.error("Error sending milestone update:", error);
  }
}

// Restart button event listener
restartBtn.addEventListener("click", restartTimer);

// Restore the timer state when the app loads
restoreState();

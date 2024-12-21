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
const milestonesList = document.getElementById("milestones-list");
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

  // Fetch milestones and update progress
  if (telegramId) {
    fetchMilestones(telegramId, elapsedTime);
  }
}

// Fetch milestones from the server
async function fetchMilestones(telegramId, elapsedTime) {
  try {
    const response = await fetch("https://6f4a-188-132-129-196.ngrok-free.app/update-milestone", {
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
    updateMilestonesDisplay(data.milestones);
  } catch (error) {
    console.error("Error fetching milestones:", error);
  }
}

function updateMilestonesDisplay(milestones) {
  milestonesList.innerHTML = ""; // Clear existing milestones

  milestones.forEach((milestone) => {
    const milestoneDiv = document.createElement("div");
    milestoneDiv.classList.add("milestone");

    const progressContainer = document.createElement("div");
    progressContainer.classList.add("progress-bar-container");

    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");
    progressBar.style.width = `${milestone.progress}%`; // Set progress dynamically
    progressContainer.appendChild(progressBar);

    const milestoneText = document.createElement("span");
    milestoneText.textContent = milestone.message;

    milestoneDiv.appendChild(progressContainer);
    milestoneDiv.appendChild(milestoneText);

    // Highlight achieved milestones
    if (milestone.achieved) {
      milestoneDiv.classList.add("achieved");
    }

    milestonesList.appendChild(milestoneDiv);
  });
}


// Restart button event listener
restartBtn.addEventListener("click", restartTimer);

// Restore the timer state when the app loads
restoreState();

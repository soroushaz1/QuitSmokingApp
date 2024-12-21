// Check if Telegram Web App is available
const telegram = window.Telegram.WebApp;
debugger;
// Initialize Telegram Web App if available
let telegramId = null;
if (telegram) {
  telegram.expand();
  telegramId = telegram.initDataUnsafe?.user?.id; // Get Telegram user ID from WebApp data
  console.log("Telegram user ID:", telegramId);

  // Set up the main button
  telegram.MainButton.text = "Share Milestones";
  telegram.MainButton.setParams({ color: "#28a745", text_color: "#ffffff" });
}

// Milestones data
const milestones = [
  { time: 20 * 60, message: "Your heart rate and blood pressure have normalized." },
  { time: 8 * 60 * 60, message: "Carbon monoxide levels in your blood return to normal." },
  { time: 24 * 60 * 60, message: "Your risk of heart attack begins to decrease." },
  { time: 48 * 60 * 60, message: "Nerve endings start regenerating, improving taste and smell." },
  { time: 72 * 60 * 60, message: "Bronchial tubes relax, making breathing easier." },
  { time: 7 * 24 * 60 * 60, message: "Your sleep patterns and energy levels begin to normalize." },
  { time: 14 * 24 * 60 * 60, message: "Circulation improves, making physical activities easier." },
  { time: 30 * 24 * 60 * 60, message: "Lung function improves by up to 30%." },
  { time: 90 * 24 * 60 * 60, message: "Cilia in your lungs recover, reducing infection risks." },
  { time: 180 * 24 * 60 * 60, message: "Your risk of lung infections is halved." },
  { time: 365 * 24 * 60 * 60, message: "Your risk of coronary heart disease is halved." },
  { time: 5 * 365 * 24 * 60 * 60, message: "Your stroke risk drops to that of a nonsmoker." },
  { time: 10 * 365 * 24 * 60 * 60, message: "Your lung cancer death risk is cut in half." },
  { time: 15 * 365 * 24 * 60 * 60, message: "Your coronary heart disease risk is that of a nonsmoker." },
];

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

    milestonesList.innerHTML = "";
    milestones.forEach((milestone) => addMilestoneToList(milestone));

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

  milestonesList.innerHTML = "";
  milestones.forEach((milestone) => addMilestoneToList(milestone));

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
  updateMilestones(elapsedTime);
}

// Add milestones to the list
function addMilestoneToList(milestone) {
  const milestoneDiv = document.createElement("div");
  milestoneDiv.classList.add("milestone");

  const progressContainer = document.createElement("div");
  progressContainer.classList.add("progress-bar-container");

  const progressBar = document.createElement("div");
  progressBar.classList.add("progress-bar");
  progressBar.style.width = "0%";
  progressContainer.appendChild(progressBar);

  const milestoneText = document.createElement("span");
  milestoneText.textContent = milestone.message;

  milestoneDiv.appendChild(progressContainer);
  milestoneDiv.appendChild(milestoneText);
  milestoneDiv.dataset.time = milestone.time;

  milestonesList.appendChild(milestoneDiv);
}

// Update milestones dynamically
function updateMilestones(elapsedTime) {
  const milestonesElements = milestonesList.querySelectorAll(".milestone");

  milestonesElements.forEach((milestoneDiv, index) => {
    const milestoneTime = milestones[index].time;
    const progressBar = milestoneDiv.querySelector(".progress-bar");

    if (elapsedTime >= milestoneTime) {
      milestoneDiv.classList.add("achieved");
      progressBar.style.width = "100%";

      if (telegram) {
        shareMilestone(`${milestones[index].message}`);
      }

      // Send milestone update if we have a valid telegramId
      if (telegramId) {
        sendMilestoneUpdate(telegramId, index, elapsedTime);
      }
    } else {
      const progress = Math.min((elapsedTime / milestoneTime) * 100, 100);
      progressBar.style.width = `${progress}%`;
    }
  });
}

// Send milestone updates to the server
async function sendMilestoneUpdate(telegramId, milestone, milestoneTime) {
  try {
    const response = await fetch("https://a433-188-132-129-196.ngrok-free.app/update-milestone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        telegramId: telegramId,
        milestone: milestone,
        milestoneTime: milestoneTime,
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


function shareMilestone(message) {
  if (telegram) {
    telegram.MainButton.onClick(() => {
      // Generate a sharable deep link for Telegram
      const milestoneShareMessage = `🎉 I just achieved this milestone in the Quit Smoking Tracker:\n\n 🎉 ${message}\n\nJoin me and start your journey here: https://t.me/QuitSmokingTrackerBot`;
      
      // Open the Telegram share menu
      telegram.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(
          milestoneShareMessage
        )}`
      );

      console.log("Milestone shared:", milestoneShareMessage);
    });
    telegram.MainButton.show();
  }
}


restartBtn.addEventListener("click", restartTimer);

// Restore the timer state when the app loads
restoreState();

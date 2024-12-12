// Check if Telegram Web App is available
const telegram = window.Telegram ? window.Telegram.WebApp : null;

// Initialize Telegram Web App only if available
if (telegram) {
  telegram.expand();

  // Set up the main button
  telegram.MainButton.text = "Share Milestones";
  telegram.MainButton.setParams({ color: "#28a745", text_color: "#ffffff" });
} else {
  console.warn("Telegram WebApp is not available. Running in fallback mode.");
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
    milestones.forEach(milestone => addMilestoneToList(milestone));

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
  milestones.forEach(milestone => addMilestoneToList(milestone));

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
    } else {
      const progress = Math.min((elapsedTime / milestoneTime) * 100, 100);
      progressBar.style.width = `${progress}%`;
    }
  });

  checkAndShowMainButton();
}

// Show Telegram Main Button if milestones are achieved
function checkAndShowMainButton() {
  if (telegram) {
    const milestonesAchieved = document.querySelectorAll(".milestone.achieved").length;
    if (milestonesAchieved > 0) {
      telegram.MainButton.show();
    } else {
      telegram.MainButton.hide();
    }
  }
}

// Handle Telegram Main Button click
if (telegram) {
  telegram.MainButton.onClick(() => {
    const achievedMilestones = [...document.querySelectorAll('.milestone.achieved span')];
    const milestoneTexts = achievedMilestones.map(m => m.textContent).join('\n');
    const message = milestoneTexts
      ? `🎉 You've achieved the following milestones:\n${milestoneTexts}`
      : "🚀 No milestones achieved yet. Keep going!";

    telegram.sendData(message);
  });
}

restartBtn.addEventListener("click", restartTimer);

// Restore the timer state when the app loads
restoreState();

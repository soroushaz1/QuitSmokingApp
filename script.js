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

const timerDisplay = document.getElementById("timer-display");
const milestonesList = document.getElementById("milestones-list");
const restartBtn = document.getElementById("restart-btn");

// Restore state
function restoreState() {
  const savedStartTime = localStorage.getItem("quitTrackerStartTime");
  if (savedStartTime) {
    startTime = parseInt(savedStartTime, 10);
    updateTimer();
    setInterval(updateTimer, 1000);
  }
}

// Start or restart timer
function startOrRestartTimer() {
  if (confirm("Are you sure you want to reset the timer?")) {
    startTime = Date.now();
    localStorage.setItem("quitTrackerStartTime", startTime);
    milestonesList.innerHTML = ""; // Clear milestones
    milestones.forEach(addMilestoneToList); // Reinitialize milestones
    updateTimer();
  }
}

// Update timer and milestones
function updateTimer() {
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(elapsedTime / 3600);
  const minutes = Math.floor((elapsedTime % 3600) / 60);
  const seconds = elapsedTime % 60;

  timerDisplay.textContent = `Time Since Quit: ${hours}h ${minutes}m ${seconds}s`;

  milestones.forEach((milestone, index) => {
    const progressBar = document.querySelectorAll(".progress-bar")[index];
    if (elapsedTime >= milestone.time) {
      progressBar.style.width = "100%";
    } else {
      const progress = Math.min((elapsedTime / milestone.time) * 100, 100);
      progressBar.style.width = `${progress}%`;
    }
  });
}

// Add milestone to list
function addMilestoneToList(milestone) {
  const milestoneDiv = document.createElement("div");
  milestoneDiv.className = "milestone";

  const progressContainer = document.createElement("div");
  progressContainer.className = "progress-bar-container";

  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";

  progressContainer.appendChild(progressBar);
  milestoneDiv.appendChild(progressContainer);

  const milestoneText = document.createElement("span");
  milestoneText.textContent = milestone.message;
  milestoneDiv.appendChild(milestoneText);

  milestonesList.appendChild(milestoneDiv);
}

// Event listeners
restartBtn.addEventListener("click", startOrRestartTimer);

// Initialize app
restoreState();
milestones.forEach(addMilestoneToList);

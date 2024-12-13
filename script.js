// Check if Telegram Web App is available
const telegram = window.Telegram ? window.Telegram.WebApp : null;

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
];

let startTime = null;
let timerInterval = null;

const timerDisplay = document.getElementById("timer-display");
const milestonesList = document.getElementById("milestones-list");
const restartBtn = document.getElementById("restart-btn");

// Restore state on load
function restoreState() {
  const savedStartTime = localStorage.getItem("quitTrackerStartTime");
  if (savedStartTime) {
    startTime = parseInt(savedStartTime, 10);
    milestones.forEach(milestone => addMilestoneToList(milestone));
    timerInterval = setInterval(updateTimer, 1000);
  } else {
    startTimer();
  }
}

// Start timer
function startTimer() {
  startTime = Date.now();
  localStorage.setItem("quitTrackerStartTime", startTime);
  milestones.forEach(milestone => addMilestoneToList(milestone));
  timerInterval = setInterval(updateTimer, 1000);
}

// Restart timer
function restartTimer() {
  if (confirm("Are you sure you want to restart the timer?")) {
    clearInterval(timerInterval);
    startTimer();
  }
}

// Update timer
function updateTimer() {
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.innerHTML = `Time Since Quit: ${elapsedTime}s`;
  updateMilestones(elapsedTime);
}

// Add milestones to the list
function addMilestoneToList(milestone) {
  const milestoneDiv = document.createElement("div");
  milestoneDiv.classList.add("milestone");
  milestoneDiv.textContent = milestone.message;
  milestonesList.appendChild(milestoneDiv);
}

// Update milestones
function updateMilestones(elapsedTime) {
  milestones.forEach(milestone => {
    if (elapsedTime >= milestone.time) {
      sendMilestoneUpdate(milestone.message, elapsedTime);
    }
  });
}

// Send milestone update to the backend
function sendMilestoneUpdate(milestone, elapsedTime) {
  fetch("https://soroushaz96.pythonanywhere.com/update-milestone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      telegramId: telegram?.initDataUnsafe?.user?.id,
      milestone: milestone,
      milestoneTime: elapsedTime,
    }),
  });
}

restartBtn.addEventListener("click", restartTimer);
restoreState();

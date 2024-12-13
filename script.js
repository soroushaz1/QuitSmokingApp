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

// Timer and UI elements
let startTime = null;
let timerInterval = null;
const timerDisplay = document.getElementById("timer-display");
const milestonesList = document.getElementById("milestones-list");

// Start timer
function startTimer() {
  startTime = Date.now();
  localStorage.setItem("quitTrackerStartTime", startTime);
  initializeMilestones(); // Reset milestone list
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

// Update timer
function updateTimer() {
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(elapsedTime / 3600);
  const minutes = Math.floor((elapsedTime % 3600) / 60);
  const seconds = elapsedTime % 60;

  timerDisplay.innerHTML = `Time Since Quit: ${hours}h ${minutes}m ${seconds}s`;

  milestones.forEach((milestone, index) => {
    if (elapsedTime >= milestone.time) {
      const milestoneDiv = document.querySelector(`#milestone-${index}`);
      if (milestoneDiv && !milestoneDiv.classList.contains("achieved")) {
        milestoneDiv.classList.add("achieved");
        milestoneDiv.querySelector(".progress-bar").style.width = "100%";
        sendMilestoneUpdate(milestone.message, elapsedTime);
      }
    }
  });
}

// Send milestone updates to the server
async function sendMilestoneUpdate(milestone, elapsedTime) {
  try {
    const response = await fetch("https://soroushaz96.pythonanywhere.com/update-milestone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        telegramId: "YOUR_TELEGRAM_ID", // Replace with dynamic user ID if available
        milestone: milestone,
        milestoneTime: elapsedTime,
      }),
    });

    if (response.ok) {
      console.log("Milestone update sent successfully.");
    } else {
      console.error("Failed to send milestone update:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending milestone update:", error);
  }
}

// Initialize milestones UI
function initializeMilestones() {
  milestonesList.innerHTML = "";
  milestones.forEach((milestone, index) => {
    const milestoneDiv = document.createElement("div");
    milestoneDiv.classList.add("milestone");
    milestoneDiv.id = `milestone-${index}`;
    milestoneDiv.innerHTML = `
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: 0%;"></div>
      </div>
      <span>${milestone.message}</span>
    `;
    milestonesList.appendChild(milestoneDiv);
  });
}

// Restore timer state on page load
function restoreState() {
  const savedStartTime = localStorage.getItem("quitTrackerStartTime");
  if (savedStartTime) {
    startTime = parseInt(savedStartTime, 10);
    initializeMilestones();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  } else {
    startTimer();
  }
}

// Initialize the app
initializeMilestones();
restoreState();

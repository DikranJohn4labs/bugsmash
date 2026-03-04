document.addEventListener("DOMContentLoaded", () => {
  const gameContainer = document.getElementById("gameContainer");
  const scoreDisplay = document.getElementById("score");
  const timeDisplay = document.getElementById("timer");
  const startGameBtn = document.getElementById("startBtn");

  const bgMusic = document.getElementById("music");
  const smashSoundEl = document.getElementById("smashSound");
  const endGameSound = document.getElementById("endGameSound");

  let score = 0;
  let timeLeft = 30;
  let timerInterval = null;
  let spawnInterval = null;
  let bugSpeed = 2;
  let bugs = [];

  const BUG_IMAGES = ["images/bug.png", "images/bug2.png"];

  document.body.addEventListener(
    "click",
    () => {
      if (!bgMusic) return;
      bgMusic.play().catch(() => {});
    },
    { once: true }
  );

  function clearBugs() {
    bugs.forEach((b) => b.remove());
    bugs = [];
  }

  function spawnBug() {
    const bug = document.createElement("img");

    bug.src = BUG_IMAGES[Math.floor(Math.random() * BUG_IMAGES.length)];

    bug.classList.add("bug");
    bug.style.left = `${Math.random() * (gameContainer.clientWidth - 40)}px`;
    bug.style.top = `${Math.random() * (gameContainer.clientHeight - 40)}px`;
    gameContainer.appendChild(bug);
    bugs.push(bug);

    let directionX = (Math.random() - 0.5) * bugSpeed;
    let directionY = (Math.random() - 0.5) * bugSpeed;

    const moveInterval = setInterval(() => {
      let x = parseFloat(bug.style.left);
      let y = parseFloat(bug.style.top);

      if (x + directionX < 0 || x + directionX > gameContainer.clientWidth - 40) {
        directionX *= -1;
      }
      if (y + directionY < 0 || y + directionY > gameContainer.clientHeight - 40) {
        directionY *= -1;
      }

      bug.style.left = `${x + directionX}px`;
      bug.style.top = `${y + directionY}px`;
    }, 30);

    bug.addEventListener("click", () => {
      clearInterval(moveInterval);
      bug.classList.add("smashed");

      if (smashSoundEl) {
        smashSoundEl.currentTime = 0;
        smashSoundEl.play().catch(() => {});
      }

      setTimeout(() => {
        bug.remove();
        bugs = bugs.filter((b) => b !== bug);
      }, 300);

      score += 1;
      scoreDisplay.textContent = String(score);
      bugSpeed += 0.2;
    });
  }

  function moveBugsAwayFromCursor(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    bugs.forEach((bug) => {
      const bugX = parseFloat(bug.style.left);
      const bugY = parseFloat(bug.style.top);
      const dx = bugX - mouseX;
      const dy = bugY - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        const angle = Math.atan2(dy, dx);
        bug.style.left = `${bugX + Math.cos(angle) * 20}px`;
        bug.style.top = `${bugY + Math.sin(angle) * 20}px`;
      }
    });
  }

  function startGame() {
    score = 0;
    timeLeft = 30;
    bugSpeed = 2;

    scoreDisplay.textContent = "0";
    timeDisplay.textContent = "1";

    clearBugs();

    if (timerInterval) clearInterval(timerInterval);
    if (spawnInterval) clearInterval(spawnInterval);

    startGameBtn.disabled = true;

    timerInterval = setInterval(() => {
      timeLeft += 1;
      timeDisplay.textContent = String(timeLeft);
}, 1000);

    spawnInterval = setInterval(spawnBug, 1000);

    document.addEventListener("mousemove", moveBugsAwayFromCursor);
  }

  function endGame() {
    if (timerInterval) clearInterval(timerInterval);
    if (spawnInterval) clearInterval(spawnInterval);
    timerInterval = null;
    spawnInterval = null;

    clearBugs();

    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
    if (endGameSound) {
      endGameSound.currentTime = 0;
      endGameSound.play().catch(() => {});
    }

    score = 0;
    alert(`Game over! Your final score is: ${score}`);
    startGameBtn.disabled = false;
    document.removeEventListener("mousemove", moveBugsAwayFromCursor);
  }

  startGameBtn.addEventListener("click", startGame);
});
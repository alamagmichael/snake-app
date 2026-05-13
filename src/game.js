const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');

const ui = {
  levelDisplay: document.querySelector('#levelDisplay'),
  scoreDisplay: document.querySelector('#scoreDisplay'),
  targetDisplay: document.querySelector('#targetDisplay'),
  levelName: document.querySelector('#levelName'),
  levelDescription: document.querySelector('#levelDescription'),
  progressText: document.querySelector('#progressText'),
  progressFill: document.querySelector('#progressFill'),
  overlay: document.querySelector('#messageOverlay'),
  startButton: document.querySelector('#startButton'),
  pauseButton: document.querySelector('#pauseButton'),
  restartButton: document.querySelector('#restartButton'),
  nextButton: document.querySelector('#nextButton'),
};

const gridSize = 24;
const cellSize = canvas.width / gridSize;
const center = Math.floor(gridSize / 2);
const levelNames = [
  'Pulse Garden', 'Glass Lane', 'Circuit Bend', 'Crystal Gate', 'Orbit Run',
  'Ion Channels', 'Vector Vault', 'Solar Steps', 'Chrome Divide', 'Neon Narrows',
  'Prism Split', 'Binary Blocks', 'Comet Cross', 'Flux Rings', 'Lazer Lattice',
  'Metro Switch', 'Quantum Quads', 'Echo Chamber', 'Plasma Spine', 'Nova Grid',
  'Vortex Field', 'Starlit Squeeze', 'Hyper Maze', 'Photon Fork', 'Gravity Well',
  'Aurora Rush', 'Tesseract Turn', 'Zenith Locks', 'Singularity', 'Neon Ascension',
];

const descriptions = [
  'Warm up by collecting neon fruit in an open arena.',
  'Slide through a clean vertical lane without touching glass rails.',
  'Navigate a simple bend that teaches corner control.',
  'Pass through the crystal gate and keep your tail tidy.',
  'Orbit a central block while your speed starts to climb.',
  'Use the channels to plan safe routes to each fruit.',
  'Small vault walls create tighter recovery windows.',
  'Step around staggered solar plates in quick bursts.',
  'A chrome divide turns the arena into two racing lines.',
  'Thread the narrows as the snake gets hungry faster.',
  'Choose between mirrored routes in a prism split.',
  'Binary block pairs demand sharper turns.',
  'Cross the comet trails without clipping their tails.',
  'Concentric rings leave only precise openings.',
  'The lattice rewards calm, deliberate movement.',
  'Switch lanes through a metro-inspired corridor map.',
  'Four hazard quadrants leave a shifting center raceway.',
  'Echo walls repeat across the board; plan two moves ahead.',
  'A long plasma spine splits your escape paths.',
  'The grid gets denser and the target keeps rising.',
  'A vortex field curls around the arena core.',
  'Squeeze through starlit alleys at high speed.',
  'The maze becomes technical with fewer open stretches.',
  'Forked photon walls force quick route decisions.',
  'Gravity well blocks pull attention toward the center.',
  'Aurora rush adds speed and scattered obstacles.',
  'Tesseract turns combine offsets, gates, and tight corners.',
  'Zenith locks ask for patient routing under pressure.',
  'The singularity surrounds the center with dangerous symmetry.',
  'A final neon gauntlet with maximum speed and target count.',
];

const patternMakers = [
  () => [],
  () => verticalLine(8, 4, 15).concat(verticalLine(15, 4, 15)),
  () => horizontalLine(7, 4, 16).concat(verticalLine(16, 7, 14)),
  () => horizontalLine(6, 5, 9).concat(horizontalLine(6, 14, 18), horizontalLine(17, 5, 9), horizontalLine(17, 14, 18)),
  () => box(9, 9, 14, 14),
  () => verticalLine(5, 3, 20).concat(verticalLine(18, 3, 20)).filter((_, index) => ![7, 8, 22, 23].includes(index)),
  () => box(5, 5, 9, 9).concat(box(14, 14, 18, 18)),
  () => horizontalLine(5, 3, 9).concat(horizontalLine(10, 8, 14), horizontalLine(15, 13, 20)),
  () => verticalLine(11, 2, 9).concat(verticalLine(12, 14, 21)),
  () => verticalLine(7, 2, 21).concat(verticalLine(16, 2, 21)).filter(({ y }) => y !== 11 && y !== 12),
  () => diagonal(4, 4, 8).concat(diagonal(19, 4, 8, -1), diagonal(4, 19, 8, 1, -1), diagonal(19, 19, 8, -1, -1)),
  () => blocks([[5, 5], [6, 5], [17, 5], [18, 5], [5, 18], [6, 18], [17, 18], [18, 18], [11, 11], [12, 12]]),
  () => horizontalLine(6, 2, 9).concat(horizontalLine(17, 14, 21), verticalLine(6, 14, 21), verticalLine(17, 2, 9)),
  () => box(6, 6, 17, 17).filter(({ x, y }) => !((x === 11 || x === 12) || (y === 11 || y === 12))),
  () => Array.from({ length: 24 }, (_, i) => i).flatMap((i) => (i % 4 === 0 ? verticalLine(i, 3, 20) : [])).filter(({ y }) => y !== 11),
  () => horizontalLine(4, 3, 20).concat(horizontalLine(12, 3, 20), horizontalLine(20, 3, 20)).filter(({ x }) => x !== 11 && x !== 12),
  () => box(3, 3, 8, 8).concat(box(15, 3, 20, 8), box(3, 15, 8, 20), box(15, 15, 20, 20)),
  () => verticalLine(4, 4, 19).concat(verticalLine(9, 4, 19), verticalLine(14, 4, 19), verticalLine(19, 4, 19)).filter(({ y }) => [7, 12, 17].includes(y) === false),
  () => verticalLine(12, 2, 21).concat(horizontalLine(6, 5, 18), horizontalLine(17, 5, 18)).filter(({ x, y }) => !(x === 12 && (y === 6 || y === 17))),
  () => Array.from({ length: 6 }, (_, i) => horizontalLine(3 + i * 4, 4, 19)).flat().filter(({ x }) => x % 5 !== 0),
  () => spiral(),
  () => verticalLine(4, 2, 21).concat(verticalLine(10, 2, 21), verticalLine(16, 2, 21), horizontalLine(5, 4, 16), horizontalLine(18, 7, 20)).filter(({ y }) => y % 6 !== 0),
  () => mazeColumns([3, 7, 11, 15, 19]),
  () => horizontalLine(4, 2, 10).concat(horizontalLine(4, 13, 21), horizontalLine(12, 2, 8), horizontalLine(12, 15, 21), horizontalLine(20, 2, 10), horizontalLine(20, 13, 21)),
  () => box(7, 7, 16, 16).concat(blocks([[10, 10], [11, 10], [12, 10], [13, 10], [10, 13], [11, 13], [12, 13], [13, 13]])),
  () => blocks([[4, 4], [5, 5], [6, 6], [17, 4], [18, 5], [19, 6], [4, 17], [5, 18], [6, 19], [17, 19], [18, 18], [19, 17], [11, 5], [12, 18], [5, 12], [18, 11]]),
  () => mazeColumns([2, 5, 8, 11, 14, 17, 20]).concat(horizontalLine(11, 4, 19)).filter(({ x, y }) => !(y === 11 && [5, 14, 20].includes(x))),
  () => box(4, 4, 19, 19).concat(box(8, 8, 15, 15)).filter(({ x, y }) => !((x === 11 || y === 11) || (x === 12 || y === 12))),
  () => box(5, 5, 18, 18).concat(box(9, 9, 14, 14), horizontalLine(11, 3, 20), verticalLine(12, 3, 20)).filter(({ x, y }) => !(x >= 10 && x <= 13 && y >= 10 && y <= 13)),
  () => mazeColumns([2, 4, 7, 10, 13, 16, 19, 21]).concat(horizontalLine(3, 3, 20), horizontalLine(20, 3, 20)).filter(({ x, y }) => (x + y) % 5 !== 0),
];

const levels = patternMakers.map((makeObstacles, index) => ({
  number: index + 1,
  name: levelNames[index],
  description: descriptions[index],
  target: 5 + Math.floor(index / 2),
  speed: Math.max(70, 165 - index * 3),
  obstacles: uniqueCells(makeObstacles()),
}));

let state = createInitialState();
let timer = null;
let lastPaintTime = 0;

function createInitialState(levelIndex = 0) {
  const level = levels[levelIndex];
  const snake = createSpawnSnake(level.obstacles);

  return {
    levelIndex,
    snake,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    fruit: placeFruit(level.obstacles, snake),
    score: 0,
    levelScore: 0,
    status: 'ready',
  };
}

function startGame() {
  if (state.status === 'won') return;
  if (state.status === 'crashed') state = createInitialState(state.levelIndex);
  state.status = 'running';
  updateOverlay('', '', true);
  scheduleTick();
  render();
}

function pauseGame() {
  if (state.status !== 'running') return;
  state.status = 'paused';
  clearTimeout(timer);
  updateOverlay('Paused', 'Press Space or Start to continue.');
  render();
}

function restartLevel() {
  clearTimeout(timer);
  state = createInitialState(state.levelIndex);
  updateOverlay('Level restarted', 'Press Start or Space when you are ready.');
  updateUi();
  render();
}

function nextLevel() {
  if (state.levelIndex >= levels.length - 1) return;
  clearTimeout(timer);
  state = createInitialState(state.levelIndex + 1);
  updateOverlay(`Level ${state.levelIndex + 1}`, levels[state.levelIndex].description);
  updateUi();
  render();
}

function scheduleTick() {
  clearTimeout(timer);
  timer = setTimeout(tick, levels[state.levelIndex].speed);
}

function tick() {
  if (state.status !== 'running') return;
  state.direction = state.nextDirection;
  const head = state.snake[0];
  const nextHead = { x: head.x + state.direction.x, y: head.y + state.direction.y };
  const level = levels[state.levelIndex];

  if (isWall(nextHead) || hasCell(level.obstacles, nextHead) || hasCell(state.snake, nextHead)) {
    crash();
    return;
  }

  state.snake.unshift(nextHead);

  if (sameCell(nextHead, state.fruit)) {
    state.score += 10 + state.levelIndex;
    state.levelScore += 1;
    if (state.levelScore >= level.target) {
      completeLevel();
      return;
    }
    state.fruit = placeFruit(level.obstacles, state.snake);
  } else {
    state.snake.pop();
  }

  updateUi();
  render();
  scheduleTick();
}

function crash() {
  clearTimeout(timer);
  state.status = 'crashed';
  updateOverlay('Collision!', 'Restart this level and try a cleaner route.');
  render();
}

function completeLevel() {
  clearTimeout(timer);
  state.score += 50 + state.levelIndex * 5;
  if (state.levelIndex === levels.length - 1) {
    state.status = 'won';
    updateOverlay('Campaign complete!', 'You conquered all 30 neon levels.');
  } else {
    state.status = 'complete';
    updateOverlay('Level cleared!', 'Advance to the next neon challenge.');
  }
  updateUi();
  render();
}

function changeDirection(directionName) {
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const next = directions[directionName];
  if (!next) return;
  const current = state.direction;
  if (current.x + next.x === 0 && current.y + next.y === 0) return;
  state.nextDirection = next;
}

function createSpawnSnake(obstacles) {
  const spawnHeads = [
    { x: center, y: center },
    { x: 4, y: 4 },
    { x: 19, y: 19 },
    { x: 12, y: 4 },
    { x: 4, y: 12 },
    { x: 19, y: 12 },
    { x: 12, y: 19 },
  ];

  for (const head of spawnHeads) {
    const snake = [head, { x: head.x - 1, y: head.y }, { x: head.x - 2, y: head.y }];
    if (snake.every((cell) => !isWall(cell) && !hasCell(obstacles, cell))) return snake;
  }

  for (let y = 2; y < gridSize - 2; y += 1) {
    for (let x = 2; x < gridSize - 2; x += 1) {
      const snake = [{ x, y }, { x: x - 1, y }, { x: x - 2, y }];
      if (snake.every((cell) => !hasCell(obstacles, cell))) return snake;
    }
  }

  return [{ x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }];
}

function placeFruit(obstacles, snake) {
  const safeCells = [];
  for (let x = 0; x < gridSize; x += 1) {
    for (let y = 0; y < gridSize; y += 1) {
      const cell = { x, y };
      if (!hasCell(obstacles, cell) && !hasCell(snake, cell)) safeCells.push(cell);
    }
  }
  return safeCells[Math.floor(Math.random() * safeCells.length)] ?? { x: 1, y: 1 };
}

function updateUi() {
  const level = levels[state.levelIndex];
  ui.levelDisplay.textContent = `${level.number} / ${levels.length}`;
  ui.scoreDisplay.textContent = String(state.score);
  ui.targetDisplay.textContent = String(level.target);
  ui.levelName.textContent = level.name;
  ui.levelDescription.textContent = level.description;
  ui.progressText.textContent = `${state.levelScore} / ${level.target}`;
  ui.progressFill.style.width = `${Math.min(100, (state.levelScore / level.target) * 100)}%`;
  ui.nextButton.disabled = state.status !== 'complete';
  ui.pauseButton.disabled = state.status !== 'running';
}

function updateOverlay(title, subtitle, hidden = false) {
  ui.overlay.classList.toggle('hidden', hidden);
  if (!hidden) {
    ui.overlay.querySelector('strong').textContent = title;
    ui.overlay.querySelector('span').textContent = subtitle;
  }
}

function animate(time = 0) {
  render(time);
  requestAnimationFrame(animate);
}

function render(time = 0) {
  lastPaintTime = time || lastPaintTime;
  const level = levels[state.levelIndex];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard(lastPaintTime);
  level.obstacles.forEach((cell) => drawCell(cell, '#19324f', '#22d3ee', 0.26));
  drawCell(state.fruit, '#fb7185', '#fb5cff', 0.88, true);
  state.snake.forEach((cell, index) => {
    const bodyColor = index === 0 ? '#55f991' : `hsl(${160 + index * 4} 88% ${Math.max(43, 66 - index)}%)`;
    drawCell(cell, bodyColor, '#55f991', index === 0 ? 0.82 : 0.42, index === 0);
  });
}

function drawBoard(time) {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#03101f');
  gradient.addColorStop(1, '#08091a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridSize; i += 1) {
    const position = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, position);
    ctx.lineTo(canvas.width, position);
    ctx.stroke();
  }

  const pulse = 0.5 + Math.sin(time / 600) * 0.18;
  ctx.shadowColor = `rgba(34, 211, 238, ${pulse})`;
  ctx.shadowBlur = 16;
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.42)';
  ctx.lineWidth = 5;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  ctx.shadowBlur = 0;
}

function drawCell(cell, fill, glow, alpha = 0.4, round = false) {
  const inset = round ? 4 : 5;
  const x = cell.x * cellSize + inset;
  const y = cell.y * cellSize + inset;
  const size = cellSize - inset * 2;
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 18 * alpha;
  ctx.fillStyle = fill;
  roundedRect(x, y, size, size, round ? 11 : 6);
  ctx.fill();
  ctx.restore();
}

function roundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function sameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

function hasCell(cells, target) {
  return cells.some((cell) => sameCell(cell, target));
}

function isWall(cell) {
  return cell.x < 0 || cell.y < 0 || cell.x >= gridSize || cell.y >= gridSize;
}

function uniqueCells(cells) {
  const seen = new Set();
  return cells.filter((cell) => {
    const key = `${cell.x}:${cell.y}`;
    if (seen.has(key) || cell.x < 0 || cell.y < 0 || cell.x >= gridSize || cell.y >= gridSize) return false;
    seen.add(key);
    return true;
  });
}

function verticalLine(x, y1, y2) {
  return range(y1, y2).map((y) => ({ x, y }));
}

function horizontalLine(y, x1, x2) {
  return range(x1, x2).map((x) => ({ x, y }));
}

function box(x1, y1, x2, y2) {
  return horizontalLine(y1, x1, x2).concat(horizontalLine(y2, x1, x2), verticalLine(x1, y1, y2), verticalLine(x2, y1, y2));
}

function diagonal(x, y, length, dx = 1, dy = 1) {
  return Array.from({ length }, (_, index) => ({ x: x + index * dx, y: y + index * dy }));
}

function blocks(coordinates) {
  return coordinates.map(([x, y]) => ({ x, y }));
}

function mazeColumns(columns) {
  return columns.flatMap((x, columnIndex) => verticalLine(x, 2, 21).filter(({ y }) => y % 5 !== columnIndex % 5));
}

function spiral() {
  return horizontalLine(4, 4, 19)
    .concat(verticalLine(19, 4, 19), horizontalLine(19, 5, 19), verticalLine(5, 8, 18), horizontalLine(8, 5, 15), verticalLine(15, 8, 15), horizontalLine(15, 9, 15))
    .filter(({ x, y }) => !((x === 19 && y === 11) || (x === 5 && y === 15) || (x === 12 && y === 8)));
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

ui.startButton.addEventListener('click', startGame);
ui.pauseButton.addEventListener('click', pauseGame);
ui.restartButton.addEventListener('click', restartLevel);
ui.nextButton.addEventListener('click', nextLevel);

document.querySelectorAll('[data-direction]').forEach((button) => {
  button.addEventListener('click', () => changeDirection(button.dataset.direction));
});

document.addEventListener('keydown', (event) => {
  const keyMap = {
    ArrowUp: 'up',
    KeyW: 'up',
    ArrowDown: 'down',
    KeyS: 'down',
    ArrowLeft: 'left',
    KeyA: 'left',
    ArrowRight: 'right',
    KeyD: 'right',
  };
  if (keyMap[event.code]) {
    event.preventDefault();
    changeDirection(keyMap[event.code]);
  }
  if (event.code === 'Space') {
    event.preventDefault();
    if (state.status === 'running') pauseGame();
    else startGame();
  }
});

updateUi();
animate();

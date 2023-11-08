/**
 * @var playBoard: DOM-элемент "Игровое поле", принимает рендер игры
 */
const playBoard = document.querySelector(".play-board");
/**
 * @var scoreElement: DOM-элемент "Текущий счет", принимает набранные игроком очки
 */
const scoreElement = document.querySelector(".fa-wallet");
/**
 * @var leftToEatElement: DOM-элемент "Счетчик еды", принимает количество еды до конца уровня
 */
const leftToEatElement = document.querySelector(".fa-carrot");
/**
 * @var timeElement: DOM-элемент "Текущее время", принимает время, оставшееся до конца уровня
 */
const timeElement = document.querySelector(".fa-clock");
/**
 * @var levelElement: DOM-элемент "Текущий уровень", принимает уровень, на котором находится игрок
 */
const levelElement = document.querySelector(".fa-stairs");
/**
 * @var lifeElement: DOM-элемент "Остаток жизней", принимает доступное игроку количество ошибок
 */
const lifeElement = document.querySelector(".fa-heart");
/**
 * @var controls: DOM-элементы "Интерактивные стрелки", принимают кнопки сенсорного управления змейкой
 */
const controls = document.querySelectorAll(".controls i");
/**
 * @var {Array of Objects} levels: параметры уровней. Номер уровня = index объекта в массиве + 1.
 */
const levels = [
  {
    /**
     * @property {number} field: количество ячеек по стороне квадратного игрового поля
     */
    field: 15,
    /**
     *  @property {number} time: продолжительность уровня в миллисекундах.
     */
    time: 300000,
    /**
     * @property {number} timeStep: интервал рендера игрового поля в миллисекундах.
     */
    timeStep: 250,
    /**
     * @property {number} food: количество кусков еды, которое игрок должен съесть на уровне.
     */
    food: 20,
    /**
     * @property {number} snakeLives: количество жизней (ошибок, которые игрок может допустить на уровне)
     */
    snakeLives: 10,
    /**
     * @var {Array of Strings} obstacles: ключевые слова, управляющие подвижностью препятствий:
     * @string fix - неподвижное
     * @string x - движущееся по оси x
     * @string y - движущееся по оси y
     */
    obstacles: ["y", "y", "fix", "x"],
    /**
     * @var {Array of objects} bonuses: параметры бонусов
     */
    bonuses: [
      {
        /**
         * @property {String} type: ключевые слова, описывающие бонусы, которые получает игрок
         * @string breakWall - игрок может выходить за пределы поля и входить в него с другой стороны
         * @string foodFreeze - еда не увеличивает длину змейки
         * @string break - змейка может разбивать препятствия при соприкосновении с ними
         * @string time - игрок получает дополнительное время
         * @string points - игрок получает дополнительные очки
         * @string lives - игрок получает дополнительные жизни
         */
        type: "breakWall",
        /**
         * @property {number | string} value: числовые значения для дополнительных времени, очков и жизней, в остальных случаях пустая строка
         */
        value: "",
        /**
         * @property {number} startFood: порядковый номер еды, вместе с которой появляется бонус.
         * @description Бонус доступен до появления еды с номером startFood + 2.
         * @description После получения бонусов "breakWall", "foodFreeze" и "break", они действуют до увеличения порядкового номера еды на 2
         */
        startFood: 0,
      },
      { type: "foodFreeze", value: "", startFood: 4 },
      // { type: "break", value: "", startFood: 1 }, // value порядковый номер type: "break"
      // { type: "time", value: 20000, startFood: 4 },
      // { type: "break", value: "", startFood: 4 },
      // { type: "points", value: 10, startFood: 4 },
      { type: "lives", value: 20, startFood: 4 },
    ],
    /**
     * @var {number} maxLevel: максимальное количество очков, которое можно набрать на уровне
     * @description вычисляется при создании уровня и используется для мотивации игрока улучшать навыки игры
     */
    maxScores: 39,
  },
];
/**
 * @var {number} maxLevel: количество уровней игры
 */
const maxLevel = levels.length;
/**
 * @var {number} level: текущий уровень, на котором находится игрок
 */
let level = 1;
/**
 * @var {number} field: размер текущего поля
 * @description количество ячеек по каждой стороне квадратного игрового поля, назначается параметром field текущего объекта из массива levels
 */
let field;
/**
 * @var {number} foodLevel: количество еды, которое змейка должна съесть на текущем уровне
 * @description назначается параметром food текущего объекта из массива levels
 */
let foodLevel;
/**
 * @var {number} currentFood: порядковый номер отображаемой еды на текущем уровне
 */
let currentFood;
/**
 * @var {boolean} isLevelComplete
 */
let isLevelComplete = false;
let screen = "";
let foodX;
let foodY;
let snakeLives;
let isMistake = false;
const obstacles = [];
let obstacleX;
let obstacleY;
let bonusX;
let bonusY;
let isBonus = false;
let isBonusEaten = false;
let isBonusShow = false;
let currentBonus;
let leftToEat;
let stepX = 0;
let stepY = 0;
let snakeX = 1;
let snakeY = 1;
let snakeBody = [[snakeX, snakeY]];
let setIntervalId;
let score = 0;
const foodPoints = 1;
let maxScores;
let levelTime;
let extraTime = 0;
let liveScores = 0;
let isTime = false;
let timeStep;
let time = 0;
const protocol = [];
let obstacleSpeed = 0;
let obstacleStepX = [];
let obstacleStopX = [];
let obstacleStepY = [];
let obstacleStopY = [];
let obstaclesX = [];
let obstaclesY = [];
let obstaclesF = [];
let isRender = false;
let isObstaclesBroken = false;
let brokenObstacle = {};
let isFoodEatRise = true;
let isBreakWallActive = false;
/**
 * Вспомогательная функция для рендера. Конвертирует формат времени из "миллисекунды" в "минуты : секунды".
 * @param {number} milliseconds Время в миллисекундах
 *   @description
 *  1) вычисляется количество полных минут в переданном функции параметре milliseconds - const minutes;
 *  2) вычисляет количество полных секунд в оставшемся после вычета полных минут параметре milliseconds - const seconds;
 *  3) игнорирует оствшиеся после вычета полных минут и полных секунд в параметре milliseconds миллисекунды - const seconds;
 *  4) для секунд меньше 10 добавляет ноль для сохранения формата возвращаемой функцией строки - const timeFormat;
 * @returns {string} Время в формате "минуты : секунды"
 */
function millisecondsToMinutesAndSeconds(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
  const timeFormat = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  return timeFormat;
}

function findLastEventIndex(protocol, eventName, eventValue) {
  let lastIndex = -1;
  for (let i = protocol.length - 1; i >= 0; i--) {
    if (protocol[i].event === eventName && protocol[i].value === eventValue) {
      lastIndex = i;
      break;
    }
  }
  return lastIndex;
}

const getCurrentFood = () => {
  const currentLevelProtocolStart = protocol.findIndex(
    (notice) => notice.event === "start level" && notice.value === level
  );
  currentFood = protocol
    .slice(currentLevelProtocolStart)
    .filter((notice) => notice.event === "food eaten").length;
};

const checkLevelComplete = () => {
  leftToEat = foodLevel - currentFood;
  if (leftToEat === 0) {
    setEvent("level is complete", level);
    extraTime = levelTime - time;
    liveScores = snakeLives * 3;
    isLevelComplete = true;
  }
};

const setEvent = (newEvent, newValue) => {
  const newRecord = { time: time, event: newEvent, value: newValue };
  protocol.push(newRecord);
  if (
    newRecord.event === "game over" ||
    newRecord.event === "level is complete"
  )
    isTime = false;
  protocolExecutor();
};
/**
 * функция резервирует ячейки поля на максимальный размер змейки начиная с первой ячеки до максимальной длины змейкм на уровне и предостовляет рандомно свободные координаты в виде массива на поле 'field'
 * @param { array } bookedCells : тип объекта который должен быть размещен на поле
 *  @description
 * а. резервируем ячейки поля на максимальный размер змейки начиная с первой ячеки до максимальной длины змейкм на уровне
 * b. генерируем случайные координаты freeCellX и freeCellY в пределах игрового поля
 * с. после проверяем поподают ли эти координаты на свободную ячейку поля, если да проверка продолжается до тех пор пока не найдется свободная ячейка
 *
 * @returns возвращает массив с свободными координатами поля
 */
const getFreeCell = (bookedCells) => {
  const snakeReserve = [];
  const snakeRows = Math.floor(foodLevel / field);
  for (let i = 0; i < snakeRows; i++) {
    for (let y = 0; y < field; y++) {
      snakeReserve.push([1 + y, 1 + i]);
    }
  }
  for (let z = 0; z < foodLevel - snakeRows * field; z++)
    snakeReserve.push([1 + z, snakeRows + 1]);
  bookedCells = bookedCells.concat(snakeReserve);
  let freeCellX;
  let freeCellY;
  do {
    freeCellX = Math.floor(Math.random() * field) + 1;
    freeCellY = Math.floor(Math.random() * field) + 1;
  } while (
    bookedCells.some(
      (coord) => coord[0] === freeCellX && coord[1] === freeCellY
    )
  );
  return [freeCellX, freeCellY];
};

const setLevel = () => {
  time = 0;
  protocol.push({ time: time, event: "start level", value: level });
  field = levels[level - 1].field;
  foodLevel = levels[level - 1].food;
  levelTime = levels[level - 1].time + extraTime;
  timeStep = levels[level - 1].timeStep;
  maxScores = levels[level - 1].maxScores;
  snakeLives = levels[level - 1].snakeLives;
  obstaclesX = levels[level - 1].obstacles.filter(
    (obstacle) => obstacle === "x"
  );
  obstacleStepX = obstaclesX.map((obstacle) => 1);
  obstacleStopX = obstaclesX.map((obstacle) => "move");
  obstaclesY = levels[level - 1].obstacles.filter(
    (obstacle) => obstacle === "y"
  );
  obstacleStepY = obstaclesY.map((obstacle) => 1);
  obstacleStopY = obstaclesY.map((obstacle) => "move");
  obstaclesF = levels[level - 1].obstacles.filter(
    (obstacle) => obstacle === "fix"
  );
  score = score + liveScores;

  isTime = false;
};

const counter = () => {
  // проверка генерации еды
  getCurrentFood();
  checkLevelComplete();

  // проверка генерации бонусов
  if (levels[level - 1].bonuses.length !== 0) {
    let bonusesList = levels[level - 1].bonuses.map((bonus) => bonus.startFood);
    bonusesList = bonusesList.map((li) => {
      return { start: li, end: li + 2 };
    });
    for (let i = 0; i < bonusesList.length; i++) {
      if (currentFood === bonusesList[i].start && !isBonusShow) {
        isBonus = true;
        isBonusShow = true;
        currentBonus = i;
        setBonusPosition();
      }
      if (currentFood === bonusesList[i].end) {
        if (isBonusShow && !isBonusEaten)
          setEvent("bonus is deleted", currentBonus + 1);
        isBonus = false;
        isBonusEaten = false;
        isBonusShow = false;
      }
    }
  }
  // проверка оставшихся жизней
  if (isMistake) {
    snakeLives -= 1;
    snakeLives < 0
      ? setEvent("game over", "lives limit")
      : setEvent("level continue", level);
  }
  // проверка на прерывание игры
  if (time >= levelTime) setEvent("game over", "time limit");
  // проверка продолжительности бонуса разбивания препятсвия

  if (isObstaclesBroken === true) {
    const breakBonusIndex = findLastEventIndex(
      protocol,
      "bonus eaten",
      " break"
    );
    if (breakBonusIndex !== -1) {
      const copiedProtocol = protocol.slice(breakBonusIndex + 1);
      const foodEatenEvents = copiedProtocol.filter(
        (event) => event.event === "food eaten"
      );
      if (foodEatenEvents.length >= 2) {
        isObstaclesBroken = false;
      }
    }
  }

  if (isFoodEatRise === false) {
    const bonusFoodFreezeIndex = findLastEventIndex(
      protocol,
      "bonus eaten",
      " foodFreeze"
    );
    if (bonusFoodFreezeIndex !== -1) {
      const copiedProtocol = protocol.slice(bonusFoodFreezeIndex + 1);
      const foodEatenEvent = copiedProtocol.filter(
        (event) => event.event === "food eaten"
      );
      if (foodEatenEvent.length >= 2) {
        isFoodEatRise = true;
      }
    }
  }
  if (isBreakWallActive === true) {
    const bonusBreakWall = findLastEventIndex(
      protocol,
      "bonus eaten",
      " breakWall"
    );
    if (bonusBreakWall !== -1) {
      const copiedProtocol = protocol.slice(bonusBreakWall + 1);
      const foodEatenEvent = copiedProtocol.filter(
        (event) => event.event === "food eaten"
      );
      if (foodEatenEvent.length >= 2) {
        isBreakWallActive = false;
      }
    }
  }
};

/**
 * Функция отвечает за установку новой позиции еды в игре на свободных ячейках поля от любых объектов
 * @param { } функция не принимает никаких параметров
 *
 * @description
 * 1) Проверяем необходимость генерации еды
 * 2) Генерируем новые коорденаты еды на свободных ячейкач поля от любых объектов включая зарезервированное место под максимальную длину змейки котороя она может занять после поедания всей еды на текущем уровне (делается это для того чтобы после потери жизни змейка появлясь в углу поля не попадала на еду) исключая бонусы
 *
 * 3) Передаем в протокол события генерации еды с ее координатами
 *
 * @returns Функция не возвращает какое-либо значение (undefined)
 */

const setFoodPosition = () => {
  /*
  Алгоритм генерации координат еды с учетом движущихся препятствий:
  */
  let copySnake = snakeBody.slice();
  if (currentFood !== foodLevel - 1) {
    [foodX, foodY] = getFreeCell(
      copySnake.concat(obstaclesF, obstaclesX, obstaclesY)
    );
    setEvent("set food", foodX + ":" + foodY);
  }
};

const setObstaclePosition = (type) => {
  /*
  Алгоритм генерации координат препятствий с учетом движущихся препятствий:
  */
  let booking = [];
  let obstacles = [];
  let obstaclesDirection =
    type === "x"
      ? obstaclesX.slice()
      : type === "y"
      ? obstaclesY.slice()
      : obstaclesF.slice();
  let copySnake = snakeBody.slice();
  if (type !== "fix") obstacles.concat(obstaclesF.slice());
  if (type === "y") obstacles.concat(obstaclesX.slice());
  booking.push(copySnake.concat(obstacles));

  obstaclesDirection = obstaclesDirection.map((obstacle) => {
    [obstacleX, obstacleY] = getFreeCell(booking);
    setEvent(
      `set obstacle ${type === "fix" ? "fix" : "moving " + type}`,
      obstacleX + ":" + obstacleY
    );
    booking.push([obstacleX, obstacleY]);
    return [obstacleX, obstacleY];
  });
  return obstaclesDirection;
};

/**
 * Функция заставляет двигаться препятствия по оси Х или У в зависимости от параметров diraction, при достижении границы поля или попадающего бонуса, самим препятствием и с едой на пути движения препятствия - препятствие меняет свое направление на противоположное (отбивается)
 * @param {string} direction : направление движения препятствия - 'x' по горозонтали, 'y' - по вертикали
 *
 *  @description
 * a. выбрать препятствия соотвествующие парметраметру diraction
 * b. задаем скорость движения припятсятвию
 * c. проверяем идет ли игра с помощью таймера если таймер запущен препятствия также движуться.
 * d. проверяем дижущиесия припятствия на сооударения с границей поля, бонусами, самим препятствием и с едой.
 * d.1. проверяем на соприкосновение с любым объектом
 * d.2. меняем шаг на обратный при соприкосновения
 * e. происходит обновление координаты препятствий если оно равно "move"
 * 1) Сначала функция создает копии массивов obstacles, obstacleStep и obstacleStop в зависимости от значения direction ("x" или "y").
 *  - это делается для того чтобы функция могла задавать движение препятствиям заданым пораметром diraction
 * 3) Затем увеличивается значение переменной obstacleSpeed на timeStep. Этим самым мы можем менять скорость двежения припатствия
 * 4) Происходит проверка: если obstacleSpeed деленное на timeStep равно 5, то выполняется следующий блок кода. Эта проверка, выполняется для определения определенного временного интервала.
 * 5) Выполняем проверку, если isTime истинно, то функция выполняет набор действий для каждого элемента массива obstacles
 * - делается для того что бы двежение припятствий останавливалось вместе с isTime
 * 6) Внутри цикла for, который перебирает элементы в массиве obstacles, происходит ряд проверок и присваиваний
 * - сщздали переменные fieldMinContact и fieldMaxContact которые обозначают границы поля
 * - fieldMinContact и fieldMaxContact зависят от сравнения координат препятствия с координатами поля и начинают движение в обратном направлении.
 * - bonusContact зависит от близости координат препятствия к координатам бонуса и начинают движение в обратном направлении.
 * - fixObstacleContact проверяет близость координат препятствия к координатам фиксированым припятсвием и начинают движение в обратном направлении.
 * @returns  функция возвращает массив, содержащий три массива: obstacles, obstacleStep, и obstacleStop, которые были созданы в ходе выполнения функции и влияют на характер движения препятствий.
 */

const moveObstacle = (direction) => {
  const obstacles = direction === "x" ? obstaclesX.slice() : obstaclesY.slice();
  const obstacleStep =
    direction === "x" ? obstacleStepX.slice() : obstacleStepY.slice();

  let obstacleStop =
    direction === "x" ? obstacleStopX.slice() : obstacleStopY.slice();
  obstacleSpeed += timeStep;
  if (obstacleSpeed / timeStep === 5) {
    if (isTime) {
      const index = direction === "x" ? [0, 1] : [1, 0];
      for (let i = 0; i < obstacles.length; i++) {
        let fieldMinContact = obstacles[i][index[0]] === 1;
        let fieldMaxContact = obstacles[i][index[0]] === field;
        let bonusContact =
          direction === "x"
            ? Math.abs(obstacles[i][index[0]] - bonusX) < 2 &&
              Math.abs(obstacles[i][index[1]] - bonusY) < 1
            : Math.abs(obstacles[i][index[0]] - bonusY) < 2 &&
              Math.abs(obstacles[i][index[1]] - bonusX) < 1;
        let fixObstacleContact = obstaclesF.some((obstacle) =>
          direction === "x"
            ? Math.abs(obstacles[i][index[0]] - obstacle[0]) < 2 &&
              Math.abs(obstacles[i][index[1]] - obstacle[1]) < 1
            : Math.abs(obstacles[i][index[0]] - obstacle[1]) < 2 &&
              Math.abs(obstacles[i][index[1]] - obstacle[0]) < 1
        );

        if (fieldMaxContact) obstacleStep[i] = -1;

        if (fieldMinContact) obstacleStep[i] = 1;
        if (bonusContact && !isBonusEaten && isBonusShow)
          obstacleStep[i] = obstacleStep[i] * -1;
        if (fixObstacleContact) obstacleStep[i] = obstacleStep[i] * -1;
        obstacles[i][index[0]] +=
          obstacleStop[i] === "move" ? obstacleStep[i] : 0;
      }
    }
    obstacleSpeed = 0;
  }
  obstacleStop = obstacleStop.map((obstacle) => "move");
  return [obstacles, obstacleStep, obstacleStop];
};

const setBonusPosition = () => {
  /*
  Алгоритм генерации координат бонусов с учетом движущихся препятствий:
  */
  let copySnake = snakeBody.slice();
  [bonusX, bonusY] = getFreeCell(
    copySnake.concat(obstaclesF, obstaclesX, obstaclesY, [[foodX, foodY]])
  );
  setEvent(
    `set ${levels[level - 1].bonuses[currentBonus].type} bonus`,
    bonusX + ":" + bonusY
  );
};

const changeDirection = (e) => {
  if (isRender) {
    const { event } = protocol[protocol.length - 1];
    let newEvent;
    let newValue;
    if (e.key === "ArrowUp" && event !== "Y") {
      newEvent = "Y";
      newValue = -1;
    } else if (e.key === "ArrowDown" && event !== "Y") {
      newEvent = "Y";
      newValue = 1;
    } else if (e.key === "ArrowLeft" && event !== "X") {
      newEvent = "X";
      newValue = -1;
    } else if (e.key === "ArrowRight" && event !== "X") {
      newEvent = "X";
      newValue = 1;
    } else {
      return;
    }
    if (isTime || !isMistake || time === 0) setEvent(newEvent, newValue);
    isTime = true;
  }
  isRender = false;
};

controls.forEach((key) => {
  key.addEventListener("click", () =>
    changeDirection({ key: key.dataset.key })
  );
});
/*
  Функция timer() запускает отсчет времени после начала игры
*/
const timer = () => {
  // время начинает расти только после того, как игра начинается (isTime === true)
  time += isTime ? timeStep : 0;
};
/*
    Функция render() выводит на экран игровое поле и табло на каждом шаге игры, 
    с учетом всех текущих изменений
  */
const render = () => {
  playBoard.style.gridTemplate = `repeat(${field}, 1fr) / repeat(${field}, 1fr)`;
  // первой создается еда
  screen = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;
  // второй создается голова змейки
  screen += `<div class="head" style="grid-area: ${snakeBody[0][1]} / ${snakeBody[0][0]}"></div>`;
  // к ней добавляется остальная часть, если она есть
  for (let i = 1; i < snakeBody.length; i++)
    screen += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
  // третьим создается препятствие
  for (let i = 0; i < obstaclesF.length; i++)
    screen += `<div class="obstacle" style="grid-area: ${obstaclesF[i][1]} / ${obstaclesF[i][0]}"></div>`;
  for (let i = 0; i < obstaclesX.length; i++)
    screen += `<div class="obstacle" style="grid-area: ${obstaclesX[i][1]} / ${obstaclesX[i][0]}"></div>`;
  for (let i = 0; i < obstaclesY.length; i++)
    screen += `<div class="obstacle" style="grid-area: ${obstaclesY[i][1]} / ${obstaclesY[i][0]}"></div>`;
  // четвертым создается бонус, если он есть
  if (isBonus && !isBonusEaten)
    screen += `<div class="bonus-${
      levels[level - 1].bonuses[currentBonus].type
    }" style="grid-area: ${bonusY} / ${bonusX}"></div>`;
  playBoard.innerHTML = screen; //!isLevelComplete ? screen : "";
  scoreElement.innerHTML = ` ${score}`;
  leftToEatElement.innerHTML = ` ${leftToEat}`;
  timeElement.innerHTML = ` ${millisecondsToMinutesAndSeconds(
    levelTime - time < 0 ? 0 : levelTime - time
  )}`;
  levelElement.innerHTML = ` ${level}`;
  lifeElement.innerHTML = ` ${snakeLives < 0 ? 0 : snakeLives}`;

  isRender = true;
};
/*
  функция checkingRestrictions() проверяет, выполняются ли установленные игрой ограничения
*/

const checkingRestrictions = () => {
  const stopDistance = 3;
  // проверка генерации еды
  getCurrentFood();
  checkLevelComplete();
  if (isTime) {
    // проверка соприкосновения змейки с препятствиями
    if (!isObstaclesBroken) {
      for (let i = 0; i < obstaclesX.length; i++) {
        if (
          Math.abs(obstaclesX[i][1] - snakeY) < stopDistance &&
          Math.abs(obstaclesX[i][0] - snakeX) < stopDistance
        )
          obstacleStopX[i] = "stop";

        if (snakeX === obstaclesX[i][0] && snakeY === obstaclesX[i][1]) {
          setEvent(
            "life lost",
            "obstacle " + obstaclesX[i][0] + ":" + obstaclesX[i][1] + " contact"
          );
        }
      }
      for (let i = 0; i < obstaclesY.length; i++) {
        if (
          Math.abs(obstaclesY[i][0] - snakeX) < stopDistance &&
          Math.abs(obstaclesY[i][1] - snakeY) < stopDistance
        )
          obstacleStopY[i] = "stop";

        if (snakeX === obstaclesY[i][0] && snakeY === obstaclesY[i][1]) {
          setEvent(
            "life lost",
            "obstacle " + obstaclesY[i][0] + ":" + obstaclesY[i][1] + " contact"
          );
        }
      }
      for (let i = 0; i < obstaclesF.length; i++)
        if (snakeX === obstaclesF[i][0] && snakeY === obstaclesF[i][1]) {
          setEvent(
            "life lost",
            "obstacle " + obstaclesF[i][0] + ":" + obstaclesF[i][1] + " contact"
          );
        }
    } else {
      for (let i = 0; i < obstaclesX.length; i++)
        if (snakeX === obstaclesX[i][0] && snakeY === obstaclesX[i][1]) {
          setEvent(
            "obstacles is broken",
            "obstacle " + obstaclesX[i][0] + ":" + obstaclesX[i][1] + " contact"
          );
          brokenObstacle.coord = obstaclesX.slice();
          brokenObstacle.name = "X";
        }

      for (let i = 0; i < obstaclesY.length; i++)
        if (snakeX === obstaclesY[i][0] && snakeY === obstaclesY[i][1]) {
          setEvent(
            "obstacles is broken",
            "obstacle " + obstaclesY[i][0] + ":" + obstaclesY[i][1] + " contact"
          );
          brokenObstacle.coord = obstaclesY.slice();
          brokenObstacle.name = "Y";
        }

      for (let i = 0; i < obstaclesF.length; i++)
        if (snakeX === obstaclesF[i][0] && snakeY === obstaclesF[i][1]) {
          setEvent(
            "obstacles is broken",
            "obstacle " + obstaclesF[i][0] + ":" + obstaclesF[i][1] + " contact"
          );
          brokenObstacle.coord = obstaclesF.slice();
          brokenObstacle.name = "F";
        }
    }

    // проверка соприкосновения с границами поля
    if (
      (snakeX <= 0 || snakeX > field || snakeY <= 0 || snakeY > field) &&
      !isBreakWallActive
    ) {
      setEvent("life lost", "border " + snakeX + ":" + snakeY + " contact");
    } else {
      if (snakeX < 0) {
        snakeX = field + 1;
      } else if (snakeX > field) {
        snakeX = 0;
      } else if (snakeY < 0) {
        snakeY = field + 1;
      } else if (snakeY > field) {
        snakeY = 0;
      }
    }

    // проверка соприкосновения змейки с самой собой
    for (let i = 0; i < snakeBody.length; i++) {
      if (
        i !== 0 &&
        snakeBody[0][1] === snakeBody[i][1] &&
        snakeBody[0][0] === snakeBody[i][0]
      ) {
        setEvent(
          "life lost",
          "contact with oneself " + snakeBody[0][0] + ":" + snakeBody[0][1]
        );
      }
    }
    isRender = false;
  }
};
/*
  функция checkingInteractions() проверяет, происходят ли доступные игроку взаимодействия
*/
const checkingInteractions = () => {
  // проверка соприкосновения змейки с едой
  if (snakeX === foodX && snakeY === foodY) {
    setEvent("food eaten", currentFood + 1);
  }
  // проверка соприкосновения змейки с бонусом
  if (snakeX === bonusX && snakeY === bonusY && isBonus && !isBonusEaten) {
    setEvent(
      "bonus eaten",
      `${levels[level - 1].bonuses[currentBonus].value} ${
        levels[level - 1].bonuses[currentBonus].type
      }`
    );
  }
};
/*
  функция moveSnake() изменяет координаты змейки
*/
const moveSnake = () => {
  if (stepX !== 0 || stepY !== 0) {
    snakeX += stepX;
    if (snakeX === 0) snakeX = -1;
    snakeY += stepY;
    if (snakeY === 0) snakeY = -1;
    // смещаем координаты каждого элемента в массиве
    // с координатами змейки на один элемент назад
    for (let i = snakeBody.length - 1; i > 0; i--) {
      snakeBody[i] = snakeBody[i - 1];
    }
    // на место освободившегося первого элемента вводим текущие
    // координаты головы змейки
    snakeBody[0] = [snakeX, snakeY];
  }
};

const protocolExecutor = () => {
  const { value, event } = protocol[protocol.length - 1];
  switch (event) {
    case "food eaten":
      if (isFoodEatRise) {
        snakeBody.push([]);
      }
      setFoodPosition();
      score += foodPoints;
      break;
    case "bonus eaten":
      if (!isBonusEaten) {
        isBonusEaten = true;
        const bonusType = levels[level - 1].bonuses[currentBonus].type;
        const bonusValue = levels[level - 1].bonuses[currentBonus].value;
        switch (bonusType) {
          case "lives":
            snakeLives += bonusValue;
            break;
          case "points":
            score += bonusValue;
            break;
          case "time":
            levelTime += bonusValue;
            break;
          case "break":
            isObstaclesBroken = true;
            break;
          case "foodFreeze":
            isFoodEatRise = false;
            break;
          case "breakWall":
            isBreakWallActive = true;
            break;
        }
      }
      break;
    case "obstacles is broken":
      switch (brokenObstacle.name) {
        case "X":
          obstaclesX = obstaclesX.filter(
            (obstacle) =>
              obstacle[0] === brokenObstacle.coord[0] &&
              obstacle[1] === brokenObstacle.coord[1]
          );
          break;
        case "Y":
          obstaclesY = obstaclesY.filter(
            (obstacle) =>
              obstacle[0] === brokenObstacle.coord[0] &&
              obstacle[1] === brokenObstacle.coord[1]
          );
          break;
        case "F":
          obstaclesF = obstaclesF.filter(
            (obstacle) =>
              obstacle[0] === brokenObstacle.coord[0] &&
              obstacle[1] === brokenObstacle.coord[1]
          );
          break;
      }
      break;
    case "start level":
      isLevelComplete = false;
      snakeX = 1;
      snakeY = 1;
      stepX = 0;
      stepY = 0;
      snakeBody = [[snakeX, snakeY]];
      obstaclesF = setObstaclePosition("fix");
      obstaclesX = setObstaclePosition("x");
      obstaclesY = setObstaclePosition("y");
      setFoodPosition();
      setIntervalId = setInterval(() => {
        // перемещение змейки по игровому полю
        moveSnake();
        // перемещение препятствий
        [obstaclesX, obstacleStepX, obstacleStopX] = moveObstacle("x");
        [obstaclesY, obstacleStepY, obstacleStopY] = moveObstacle("y");
        // проверка всех предусмотренных игрой ограничений
        checkingRestrictions();
        counter();
        // вывод текущего изображения игры
        render();
        // проверка доступных игроку взаимодействий
        checkingInteractions();
        // отсчет игрового времени
        timer();
      }, timeStep);
      break;
    case "level is complete":
      level++;
      isTime = false;
      if (level > maxLevel) {
        clearInterval(setIntervalId);
        alert("You WIN! Press OK to replay...");
        localStorage.setItem("protocol", JSON.stringify(protocol));
        location.reload();
        break;
      }
      clearInterval(setIntervalId);
      alert(
        `Level ${
          level - 1
        } is complete! Congratulation! Well done! It's time to Level ${level}`
      );
      setLevel();
      protocolExecutor();
      break;
    case "life lost":
      isMistake = true;
      alert(
        `You made a mistake ${value} here! Be careful! You only have ${snakeLives} lives left!`
      );
      stepX = 0;
      stepY = 0;
      let snakeLength = snakeBody.length;
      snakeX = snakeLength;
      snakeY = 1;
      snakeBody = [[snakeX, snakeY]];
      for (let i = 1; i < snakeLength; i++) snakeBody.push([snakeX - i, 1]);
      isTime = false;
      break;

    case "level continue":
      isMistake = false;
      break;
    case "game over":
      clearInterval(setIntervalId);
      if (value === "out of lives") {
        alert("Out of lives! Press OK to replay...");
        localStorage.setItem("protocol", JSON.stringify(protocol));
        location.reload();
        return; // Exit the function to prevent the game from restarting immediately
      } else {
        alert("Game over! Press OK to replay...");
      }
      localStorage.setItem("protocol", JSON.stringify(protocol));
      location.reload();
      break;
    case "X":
      stepX = value;
      stepY = 0;
      break;
    case "Y":
      stepX = 0;
      stepY = value;
      break;
  }
};

// игра
setLevel();
protocolExecutor();

document.addEventListener("keydown", changeDirection);

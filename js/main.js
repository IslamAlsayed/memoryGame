// Span start game
let startGame = document.getElementById('start-game');
let pause = false; // is timer paused
let gameLevel, countGameLevelBlocks;

let levels = document.querySelectorAll('.control-buttons .levels span');

levels.forEach(level => {
  level.addEventListener('click', () => {
    levels.forEach(level => level.classList.remove('active'))

    document.querySelector('.control-buttons .levels').classList.add('choiced')
    level.classList.add('active')

    let containerLevels = document.querySelector('.control-buttons .levels');

    if (containerLevels.classList.contains('choiced')) {
      startGame.style.pointerEvents = 'all';
      startGame.style.cursor = 'pointer';
      startGame.style.background = '#f66';
      startGame.addEventListener('mousemove', () => startGame.style.background = 'red')
      startGame.addEventListener('mouseleave', () => startGame.style.background = '#f66')
    }

  })
})

document.addEventListener('click', (e) => {
  if (e.target.id == 'start-game') {
    // Pause countdown timer
    pause = false;

    // Count down to timer function
    countDown_Timer()

    // Prompt window to ask for name
    let yourName = prompt('What\'s your name?');

    let start = new Audio('./sounds/start.mp3');
    start.play();

    let spanName = document.querySelector('.info-container .name span');

    // If name is empty
    if (yourName == null || yourName == "") {
      // Set name to Unknown
      spanName.innerHTML = spanName.innerHTML + "Unknown";

      // If name is not empty
    } else {

      // Set name to your name
      spanName.innerHTML = spanName.innerHTML + yourName;

    }

    // Get date in localStorage
    getDateInLocalStorage();

    let activeLevel = document.querySelector('.control-buttons .levels span.active');

    gameLevel = activeLevel.dataset.level
    countGameLevelBlocks = activeLevel.dataset.topic

    document.querySelector('.memory-game-blocks').classList.add(gameLevel);

    // Insert blocks in container in Html
    insertBlockInContainerHTML();

    // Remove overlay by click span
    document.querySelector('.control-buttons').remove();

  }
})

// Custom duration
let duration = 1000;

let blocksContainer = document.querySelector('.memory-game-blocks');

// Insert blocks in container in Html
function insertBlockInContainerHTML() {
  fetch("./js/blocks.json")
    .then((response) => response.json())
    .then((myJson) => {

      let blocksContainer = document.querySelector('.memory-game-blocks');

      let countBlocks = countGameLevelBlocks.split('*').shift();
      countBlocks = ((countBlocks * countBlocks) / 2);

      for (let i = 0; i < countBlocks; i++) {
        blocksContainer.innerHTML += `
          <div class="game-block" data-icons="${myJson.blocks[i].dataIcons}">
            <div class="face front"></div>
            <div class="face back">
              <img src="${myJson.blocks[i].src}" alt="" />
            </div>
          </div>
          <div class="game-block" data-icons="${myJson.blocks[i].dataIcons}">
            <div class="face front"></div>
            <div class="face back">
              <img src="${myJson.blocks[i].src}" alt="" />
            </div>
          </div>`;
      }

      let blocks = Array.from(blocksContainer.children);
      let orderRange = [...Array(blocks.length).keys()];

      shuffle(orderRange);
      blocks.forEach((block, index) => {
        block.style.order = orderRange[index];
        block.addEventListener('click', () => {
          flipBlock(block, blocks);
        })
      })

    })
}

// Flip block function
function flipBlock(selectedBlock, blocks) {

  // Add block class flip
  selectedBlock.classList.add('is-flipped');

  let allFlippedBlocks = blocks.filter(flippedBlock => flippedBlock.classList.contains('is-flipped'));

  if (allFlippedBlocks.length === 2) {

    // Stop clicking function
    stopClicking()

    // Ckeck matched block function
    ckeckMatchedBlocks(allFlippedBlocks[0], allFlippedBlocks[1], blocks)

  } else {
    let click = new Audio('./sounds/click.mp3');
    click.play();
  }
}

// Ckeck matched block function
function ckeckMatchedBlocks(firstBlock, secondBlock, blocks) {

  let triesElement = document.querySelector('.tries span');

  if (firstBlock.dataset.icons === secondBlock.dataset.icons) {

    firstBlock.classList.remove('is-flipped')
    secondBlock.classList.remove('is-flipped')

    firstBlock.classList.add('has-match')
    secondBlock.classList.add('has-match')

    let success = new Audio('./sounds/success.mp3');
    success.play();

  } else {

    triesElement.innerHTML = parseInt(triesElement.innerHTML) + 1;

    if (triesElement.innerHTML >= 5) {
      document.querySelector('.tries').style.color = 'red';

      // Add class 'stopClicking' on the container
      blocksContainer.classList.add('stop-clicking');
    }

    setTimeout(() => {
      firstBlock.classList.remove('is-flipped')
      secondBlock.classList.remove('is-flipped')
    }, duration)

    let wrong = new Audio('./sounds/wrong.mp3');
    wrong.play();

  }

  if (blocks.filter(flippedBlock => !flippedBlock.classList.contains('has-match')).length == 0) {

    // Pause countdown timer
    pause = true;

    let finish = new Audio('./sounds/finish.mp3');
    finish.play();

    // Set date in localStorage
    setDateInLocalStorage();

    let gameOver = document.createElement('div');
    gameOver.classList = 'control-buttons';
    gameOver.innerHTML = `<div id="levels" class="levels">
        <span data-level="easy" data-topic="4*4">easy</span>
        <span data-level="middle" data-topic="6*6">middle</span>
        <span data-level="hard" data-topic="8*8">hard</span>
      </div>
      <span id="start-game" class="start-game">start game</span>`;

    document.body.prepend(gameOver)

    blocks.forEach(block => {
      block.classList.remove('has-match')
    })

    document.querySelector('.info-container .name span').innerHTML = '';
    document.querySelector('.tries span').innerHTML = 0;
  }
}

// Stop clicking on all blocks
function stopClicking() {

  // Add class 'stopClicking' on the container
  blocksContainer.classList.add('stop-clicking');

  setInterval(() => {
    blocksContainer.classList.remove('stop-clicking');
  }, duration)
}

// Count down to timer function
function countDown_Timer() {

  let countDown = document.querySelector('.countDown');
  let minute = document.querySelector('.countDown').dataset.minute;

  startTimer(minute, countDown)

  function startTimer(duration, display) {
    var timer = (duration * 60), minutes, seconds;

    let stopped = setInterval(function () {

      // Pause and Resume Timer
      if (!pause) {
        minutes = parseInt(timer / 60);
        seconds = parseInt(timer % 60);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.innerHTML = minutes + ":" + seconds;

        if (--timer < 0) {
          clearInterval(stopped)
          countDown.style.color = 'red';

          // Set date in localStorage
          setDateInLocalStorage();

          let gameOver = document.createElement('div');
          gameOver.classList = 'control-buttons';
          gameOver.innerHTML = `<div id="levels" class="levels">
        <span data-level="easy" data-topic="4*4">easy</span>
        <span data-level="middle" data-topic="6*6">middle</span>
        <span data-level="hard" data-topic="8*8">hard</span>
      </div>
          <span id="start-game" class="start-game">start game</span>`;

          document.body.prepend(gameOver)

          blocks.forEach(block => {
            block.classList.remove('has-match')
          })

          document.querySelector('.info-container .name span').innerHTML = '';
          document.querySelector('.tries span').innerHTML = 0;
        }

        document.addEventListener('click', (e) => {
          if (e.target.id == 'start-game') {
            timer = (duration * 60), minutes, seconds;
          }
        })
      }
    }, 1000);
  }
}

// Pause countdown timer
document.getElementById('pause').addEventListener('click', function () {
  let allBlocks = document.querySelectorAll('.memory-game-blocks .game-block');

  pause = true;
  document.getElementById('pause').style.display = 'none';
  document.getElementById('resume').style.display = 'block';

  allBlocks.forEach(block => {
    block.querySelector('.front').style.opacity = '.5';
  })

  blocksContainer.style.pointerEvents = 'none';

});

// Resume countdown timer
document.getElementById('resume').addEventListener('click', function () {
  let allBlocks = document.querySelectorAll('.memory-game-blocks .game-block');

  pause = false;
  document.getElementById('pause').style.display = 'block';
  document.getElementById('resume').style.display = 'none';

  allBlocks.forEach(block => {
    block.querySelector('.front').style.opacity = '1';
  })

  blocksContainer.style.pointerEvents = 'all';

});

// Open alert history
document.getElementById('history').addEventListener('click', function () {
  pause = true;
  document.getElementById('alert-history').classList.add('show')
  document.querySelector('.alert-history .layout').classList.add('show')
});

// Close alert history
document.addEventListener('click', (e) => {
  if (e.target.id == 'alert-history') {
    pause = false;
    document.querySelector('.alert-history').classList.remove('show');
    document.querySelector('.alert-history .layout').classList.remove('show');
  }
})

// Function shuffle to array
function shuffle(array) {

  let cardsCount = array.length;
  let temp, random;

  while (cardsCount > 0) {

    // get random number
    random = Math.floor(Math.random() * cardsCount);
    cardsCount--;

    temp = array[cardsCount];

    array[cardsCount] = array[random];

    array[random] = temp;

  }

  return array;

}

// Set date in localStorage
function setDateInLocalStorage() {
  let time2 = document.querySelector('.countDown').innerHTML;
  let minute = document.querySelector('[data-minute="2"]').dataset.minute;

  let newUser = {
    name: document.querySelector('.info-container .name span').innerHTML,
    time: (minute * 60) - (time2.split(':')[0] * 60 + time2.split(':')[1] % 60),
    tries: document.querySelector('.tries span').innerHTML
  };

  let Users = JSON.parse(localStorage.getItem('users')) || [];
  Users.push(newUser);
  localStorage.setItem('users', JSON.stringify(Users));
}

// Get date in localStorage
function getDateInLocalStorage() {
  let allUsers = JSON.parse(localStorage.getItem('users'));
  if (allUsers != null) {
    allUsers.forEach((user, index) => {
      document.getElementById('tbody').innerHTML +=
        `<div class="user">
        <span>${index + 1}</span>
        <span>${user.name}</span>
        <span>${user.time}</span>
        <span>${user.tries}</span>
      </div>`;
    })

    let reset = document.querySelector('.tfoot .reset');
    reset.innerHTML += ' ' + allUsers.length;

    reset.addEventListener('click', () => {
      if (localStorage.clear('users')) {
        document.getElementById('tbody').innerHTML = '';
        getDateInLocalStorage()
      }
    })
  } else {
    document.querySelector('.tfoot .reset').classList.add('empty')
  }
}
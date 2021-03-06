const grid = document.querySelector('.grid');
const gameOverDiv = document.querySelector('.game-over');
const flagsLeft = document.querySelector('.flags-left');
const reset = document.querySelector('.reset-btn');
const timer = document.querySelector('.timer-value');
let inputContainer = document.querySelector('.nickname-input-container');
let input = document.querySelector('#nickname-input');
let submitBtn = document.querySelector('.submit-btn');
let previousScores = getItemsFromStorage();
let scoreTable = document.querySelector('.score-table');

function getItemsFromStorage() {
    let items;
    if (localStorage.getItem('items') === null) {
        items = [];
    } else {
        items = JSON.parse(localStorage.getItem('items'));
    }
    return items;
}

displayScores(previousScores);

// Display previous scores
function displayScores(previousScores) {
    if (previousScores.length < 1) {
        scoreTable.style.display = 'none';
    } else {
        scoreTable.style.display = 'block';
        previousScores.forEach((item) => {
            let score = document.createElement('li');
            score.classList.add('score-entry');
            score.innerHTML = `
            <span class="player">${item.nickName}</span>: <span class="score">${item.winningTime}</span> s
            `;
            scoreTable.appendChild(score);
        });
    }

}

// Reset scores display
function resetScores() {
    scoreTable.innerHTML = '';
}

class GameVars {
    constructor(nickName, bombAmount, flags, isGameOver, timerStarted, time, cancelledTimer, timeInstance) {
        this.bombAmount = bombAmount;
        this.flags = flags;
        this.isGameOver = isGameOver;
        this.timerStarted = timerStarted;
        this.time = time;
        this.cancelledTimer = cancelledTimer;
        this.timeInstance = timeInstance;
        this.nickName = nickName;
    }
}

const gameInstance = new GameVars(null, 20, 0, false, false, 0, false, null);

// Game function
function game() {
    let width = 10;
    let squares = [];
    const size = width * width;
    submitBtn = document.querySelector('.submit-btn');
    inputContainer = document.querySelector('.nickname-input-container');
    input = document.querySelector('#nickname-input');

    // Nickname submit
    submitBtn.addEventListener('click', e => {
        gameInstance.nickName = input.value;
        if (gameInstance.nickName.length > 2) {
            inputContainer.style.fontWeight = 'bold';
            inputContainer.style.fontSize = '30px';
            inputContainer.innerHTML = `Current Player: ${gameInstance.nickName}`;
        }

        e.preventDefault();
    })

    // Timer
    const timerFunction = function () {
        if (gameInstance.cancelledTimer) {
            return;
        }
        console.log(gameInstance.time);
        timer.innerText = `${gameInstance.time}`;
        gameInstance.time++;
        gameInstance.timeInstance = setTimeout(timerFunction, 1000);
    };

    // Create board
    function createBoard() {
        // Get shuffled game array with random bombs
        const bombsArray = Array(gameInstance.bombAmount).fill('bomb');
        const emptyArray = Array(size - gameInstance.bombAmount).fill('valid');
        const gameArray = emptyArray.concat(bombsArray);
        const shuffledArray = gameArray.sort(() => Math.random() - 0.5);
        flagsLeft.firstChild.data = `${gameInstance.bombAmount}`;

        for (let i = 0; i < size; i++) {
            const square = document.createElement('div');
            square.setAttribute('id', i);
            square.classList.add(shuffledArray[i]);
            // square.innerText = square.id;
            grid.appendChild(square);
            squares.push(square);

            // Normal click
            square.addEventListener('click', e => {
                if (!gameInstance.timerStarted) {
                    gameInstance.timerStarted = true;
                    if (gameInstance.timerStarted) {
                        timerFunction();
                        input.disabled = true;
                        submitBtn.disabled = true;
                    }
                }
                click(square);
            });

            square.oncontextmenu = function (e) {
                addFlag(square);
                e.preventDefault();
            }
        }

        // Add adjacent bombs info to the square
        for (let i = 0; i < squares.length; i++) {
            let total = 0;
            const isLeftEdge = (i % width === 0);
            const isRightEdge = (i % width === width - 1);

            if (squares[i].classList.contains('valid')) {
                // Left
                if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains('bomb')) total++;
                // Right
                if (!isRightEdge && squares[i + 1].classList.contains('bomb')) total++;
                // Top Right
                if ((i > width - 1) && !isRightEdge && squares[i + 1 - width].classList.contains('bomb')) total++;
                // Top
                if ((i > width - 1) && squares[i - width].classList.contains('bomb')) total++;
                // Top Left
                if (i > width && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb')) total++;
                // Bottom Right
                if ((i < size - width - 1) && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) total++;
                // Bottom
                if ((i < size - width) && squares[i + width].classList.contains('bomb')) total++;
                // Bottom Left
                if ((i < size - width) && !isLeftEdge && squares[i - 1 + width].classList.contains('bomb')) total++;
                squares[i].setAttribute('data', total);
            }
        }
    }

    createBoard();

    // Add or remove flag with right click
    function addFlag(square) {
        if (gameInstance.isGameOver) return;
        if (!square.classList.contains('checked') && gameInstance.flags < gameInstance.bombAmount) {
            if (!square.classList.contains('flag')) {
                square.classList.add('flag');
                square.innerText = '🚩';
                gameInstance.flags++;
            } else {
                square.classList.remove('flag');
                square.innerText = '';
                gameInstance.flags--;
            }
        } else if (square.classList.contains('flag')) {
            square.classList.remove('flag');
            square.innerText = '';
            gameInstance.flags--;
        }
        flagsLeft.firstChild.data = `${gameInstance.bombAmount - gameInstance.flags}`;
    }

    // Click on square actions
    function click(square) {
        let currentId = square.id;
        if (gameInstance.isGameOver) return;
        if (square.classList.contains('checked') || square.classList.contains('flag')) return;
        if (square.classList.contains('bomb')) {
            gameOver(square);
        } else {
            let total = square.getAttribute('data');
            if (total != 0) {
                square.classList.add('checked');
                square.innerHTML = total;
                square.style.fontWeight = 'bold';
                checkForWin();
                switch (total) {
                    case '1':
                        square.style.color = 'blue';
                        break;
                    case '2':
                        square.style.color = 'green';
                        break;
                    case '3':
                        square.style.color = 'red';
                        break;
                    case '4':
                        square.style.color = 'navy';
                        break;
                    case '5':
                        square.style.color = 'darkred';
                        break;
                    case '6':
                        square.style.color = 'orange';
                        break;
                    case '7':
                        square.style.color = 'pink';
                        break;
                    case '8':
                        square.style.color = 'yellow';
                }
                return;
            }
            checkSquare(currentId);
        }
        square.classList.add('checked');
    }

    // Check neighbouring squares for total if the clicked square is empty, don't stop till all possible totals are found
    function checkSquare(currentId) {
        const isLeftEdge = (currentId % width === 0);
        const isRightEdge = (currentId % width === width - 1);
        setTimeout(() => {
            // Left
            if (currentId > 0 && !isLeftEdge) {
                const newId = parseInt(currentId) - 1;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            // Right
            if (!isRightEdge) {
                const newId = parseInt(currentId) + 1;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            // Top Right
            if ((currentId > width - 1) && !isRightEdge) {
                const newId = parseInt(currentId) + 1 - width;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            // Top
            if ((currentId > width - 1)) {
                const newId = parseInt(currentId) - width;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            // Top Left
            if (currentId > width && !isLeftEdge && !isRightEdge) {
                const newId = parseInt(currentId) - 1 - width;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            // Bottom Right
            if ((currentId < size - width - 1) && !isRightEdge) {
                const newId = parseInt(currentId) + 1 + width;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            // Bottom
            if (currentId < size - width) {
                const newId = parseInt(currentId) + width;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            // Bottom Left
            if ((currentId < size - width) && !isLeftEdge) {
                const newId = parseInt(currentId) - 1 + width;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            checkForWin();
        }, 10);
    }

    // Game Over
    function gameOver(square) {
        input.disabled = true;
        submitBtn.disabled = true;
        gameInstance.cancelledTimer = true;
        square.style.background = 'red';
        gameOverDiv.innerText = 'BOOM! Game Over! 💣';
        gameOverDiv.style.color = 'red';
        reset.innerText = '💀';
        gameInstance.isGameOver = true;

        // Show all bombs
        squares.forEach(square => {
            if (square.classList.contains('bomb')) {
                square.innerText = '💣';
            }
        })
    }

    // Check for win
    function checkForWin() {
        if (document.querySelectorAll('.checked').length === (size - gameInstance.bombAmount) && !gameInstance.isGameOver) {
            input.disabled = true;
            submitBtn.disabled = true;
            gameInstance.cancelledTimer = true;
            gameInstance.isGameOver = true;
            if (gameInstance.nickName) {
                let winningTime = gameInstance.time;
                storeScore(gameInstance.nickName, winningTime);
                resetScores();
                displayScores(getItemsFromStorage());
            }
            gameOverDiv.innerText = 'You won! 🚩';
            gameOverDiv.style.color = 'green';
        }
    }

    // Storing scores in Local Storage
    function storeScore(nickName, winningTime) {
        let items;
        // Check if any items in LS
        if (localStorage.getItem('items') === null) {
            items = [];
            // Push new item
            items.push({
                nickName,
                winningTime
            });
            // Set LS
            localStorage.setItem('items', JSON.stringify(items));
        } else {
            // Get what is already in LS
            items = JSON.parse(localStorage.getItem('items'));

            // Sort the items array in ascending order depending on completion time
            items.sort((a, b) => {
                return a.winningTime - b.winningTime;
            });


            if (items.length < 5) {
                // Add item if score array is shorter than 5
                items.push({
                    nickName,
                    winningTime
                });

                // Check if the current score is better than the last score in LS
            } else if (winningTime < items[4].winningTime) {
                items.pop();
                items.push({
                    nickName,
                    winningTime
                });
            };

            // Sort the items array in ascending order depending on completion time
            items.sort((a, b) => {
                return a.winningTime - b.winningTime;
            });
            console.log(items);

            // reset LS
            localStorage.setItem('items', JSON.stringify(items));
        }
    }
}

// Reset Game
reset.addEventListener('click', e => {
    input.value = '';
    inputContainer.style.fontWeight = 'normal';
    inputContainer.style.fontSize = '16px';
    inputContainer.innerHTML =
        `
            <label for="nickname-input-label">Enter Your Nickname: </label>
            <input maxlength=12 minlength=3 required type="text" id="nickname-input" placeholder="Between 3 and 12 signs">
            <button type="submit" class="submit-btn">Submit</button>
    `;
    clearTimeout(gameInstance.timeInstance);
    gameInstance.nickName = null;
    gameInstance.bombAmount = 20;
    gameInstance.flags = 0;
    gameInstance.isGameOver = false;
    gameInstance.timerStarted = false;
    gameInstance.time = 0;
    gameInstance.cancelledTimer = false;
    timer.innerText = '0';
    gameOverDiv.innerText = '';
    grid.innerHTML = '';
    reset.innerText = '😉';
    game();
    console.clear();
    e.preventDefault();
});

game();
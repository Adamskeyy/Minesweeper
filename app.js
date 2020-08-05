const grid = document.querySelector('.grid');
const gameOverDiv = document.querySelector('.game-over');
let flagsLeft = document.querySelector('.flags-left');
let reset = document.querySelector('.reset-btn');

function game() {
    let width = 10;
    let squares = [];
    let bombAmount = 20;
    let flags = 0;
    const size = width * width;
    let isGameOver = false;
    let timerStarted = false;

    // Create board
    function createBoard() {
        // Get shuffled game array with random bombs
        const bombsArray = Array(bombAmount).fill('bomb');
        const emptyArray = Array(size - bombAmount).fill('valid');
        const gameArray = emptyArray.concat(bombsArray);
        const shuffledArray = gameArray.sort(() => Math.random() - 0.5);
        flagsLeft.firstChild.data = `${bombAmount}`;

        for (let i = 0; i < size; i++) {
            const square = document.createElement('div');
            square.setAttribute('id', i);
            square.classList.add(shuffledArray[i]);
            // square.innerText = square.id;
            grid.appendChild(square);
            squares.push(square);

            // Normal click
            square.addEventListener('click', e => {
                if (!timerStarted) {
                    timerStarted = true;
                }
                click(square);
            })

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
                // console.log(squares[i]);
            }
        }
    }

    createBoard();

    // Add or remove flag with right click
    function addFlag(square) {
        if (isGameOver) return;
        if (!square.classList.contains('checked') && flags < bombAmount) {
            if (!square.classList.contains('flag')) {
                square.classList.add('flag');
                square.innerText = '🚩';
                flags++;
                // checkForWin();
            } else {
                square.classList.remove('flag');
                square.innerText = '';
                flags--;
            }
        } else if (square.classList.contains('flag')) {
            square.classList.remove('flag');
            square.innerText = '';
            flags--;
        }
        flagsLeft.firstChild.data = `${bombAmount - flags}`;
    }

    // Click on square actions
    function click(square) {
        let currentId = square.id;
        if (isGameOver) return;
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
                    case '1': square.style.color = 'blue';
                        break;
                    case '2': square.style.color = 'green';
                        break;
                    case '3': square.style.color = 'red';
                        break;
                    case '4': square.style.color = 'navy';
                        break;
                    case '5': square.style.color = 'darkred';
                        break;
                    case '6': square.style.color = 'orange';
                        break;
                    case '7': square.style.color = 'pink';
                        break;
                    case '8': square.style.color = 'yellow';
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
        }, 10);
    }

    // Game Over
    function gameOver(square) {
        square.style.background = 'red';
        gameOverDiv.innerText = 'BOOM! Game Over! 💣';
        gameOverDiv.style.color = 'red';
        reset.innerText = '💀';
        console.log('BOOM! Game Over! 💣💣💣')
        isGameOver = true;

        // Show all bombs
        squares.forEach(square => {
            if (square.classList.contains('bomb')) {
                square.innerText = '💣';
            }
        })
    }

    // Check for win
    function checkForWin() {
        // let matches = 0;
        if (document.querySelectorAll('.checked').length === (size - bombAmount) && !isGameOver) {
            isGameOver = true;
            gameOverDiv.innerText = 'You won! 🚩';
            gameOverDiv.style.color = 'green';
        }
        // for (let i = 0; i < squares.length; i++) {
        //     if (squares[i].classList.contains('flag') && squares[i].classList.contains('bomb')) {
        //         matches++;
        //     }
        //     if (matches === bombAmount) {
        //         isGameOver = true;
        //         gameOverDiv.innerText = 'You won! 🚩';
        //         gameOverDiv.style.color = 'green';
        //     }
        // }
    }

}

game();



reset.addEventListener('click', e => {
    console.clear();
    gameOverDiv.innerText = '';
    grid.innerHTML = '';
    reset.innerText = '😉';
    game();
    e.preventDefault();
});
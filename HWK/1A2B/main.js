const startBtn = document.querySelector("#start_btn");
const showAnsBtn = document.querySelector("#show_answer_btn");
const restartBtn = document.querySelector("#restart_btn");
const guessHistoryList = document.querySelector("#guess_history_list");
const guessInput = document.querySelector("#guess_input");
const guessBtn = document.querySelector("#guess_btn");
const gameMsgToast = document.querySelector("#game_msg_toast");
const toastBootstrap = new bootstrap.Toast(gameMsgToast, {
    delay: 1000
});
const modalBootstrap = new bootstrap.Modal(document.querySelector("#end_game_modal"))
const endGameBtn = document.querySelector("#end_game_btn");


let answer;


function initGame() {
    // 產出answer
    answer = generateAns();
    // 清空紀錄
    guessHistoryList.innerHTML = "";
    guessInput.value = "";
}

function generateAns() {
    const numArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    numArr.sort((a, b) => getRandomArbitrary(-1, 1));
    return numArr.slice(0, 4).join("");
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function showHint(msg) {
    gameMsgToast.querySelector(".toast-body").textContent = msg;
    // const toastBootstrap = bootstrap.Toast.getOrCreateInstance(gameMsgToast);
    toastBootstrap.show();
}

function appendHistory(a, b, input) {
    const li = document.createElement("li");
    li.classList.add("list-group-item");
    const span = document.createElement("span");
    const badgeColor = a === 4 ? "bg-success" : "bg-danger"
    span.classList.add("badge", badgeColor);
    span.textContent = `${a}A${b}B`;
    li.append(span, input);
    guessHistoryList.append(li);
}

function showAnswer() {
    if (answer == undefined) {
        showHint("請先開始遊戲");
    } else {
        showHint(`答案:${answer}`);
    }
}

function inputGuess() {
    if (answer == undefined) {
        showHint("請先開始遊戲");
    } else {
        const val = guessInput.value.trim();
        // 驗證輸入合法性
        if (val === "" || isNaN(val) || val.length > 4 || new Set(val).size !== 4) {
            showHint("請輸入符合規則的數字")
            guessInput.value = "";
            return
        }
        // a,b
        let a = 0, b = 0;
        for (let i = 0; i < answer.length; i++) {
            if (val[i] === answer[i]) {
                a++;
            } else if (answer.includes(val[i])) {
                b++;
            }
        }
        if (a === 4) {
            // 過關
            modalBootstrap.show();
        }

        guessInput.value = "";
        appendHistory(a, b, val);
    }
}

startBtn.addEventListener("click", initGame);
restartBtn.addEventListener("click", initGame);
showAnsBtn.addEventListener("click", showAnswer);
guessBtn.addEventListener("click", inputGuess);
endGameBtn.addEventListener("click", initGame);

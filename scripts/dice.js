/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isNull(x) {
    return ((typeof x === undefined) || (x === undefined) || (x === 'null') || (x === null) || (x === 'undefined'));
}

function makeRoll(roll) {
    let messages = document.getElementById('messages');

    let result = document.createElement("div");
    result.classList.add("message");

    if (messages.scrollHeight - messages.clientHeight <= messages.scrollTop + 1) {
        setTimeout(function () {
            messages.scrollTop = messages.scrollHeight - messages.clientHeight;
        }, 5);
    }

    messages.appendChild(result);

    result.innerHTML = "<span class='message__line_number'>" + messages.dataset.entries + "</span>" + roll + " -> <span class='message__result'>" + rollDice(roll) + "</span>";
    messages.dataset.entries++;
}

function makeGraph(roll, samples = 10000) {
    let test = distTest(roll, samples);

    let graphContainer = document.createElement("div");
    graphContainer.classList.add("graph_container");

    // Number  Heading
    let heading = document.createElement("span");
    heading.classList.add("graph__heading");
    heading.innerText = "#";
    graphContainer.appendChild(heading);

    // Frequency Heading
    heading = document.createElement("span");
    heading.classList.add("graph__heading");
    heading.innerText = "Freq.";
    graphContainer.appendChild(heading);

    // Probability Heading
    heading = document.createElement("span");
    heading.classList.add("graph__heading");
    heading.innerText = "%";
    graphContainer.appendChild(heading);

    // Output Heading
    heading = document.createElement("span");
    heading.innerText = roll + ", " + samples + " Samples";
    heading.classList.add("graph__heading");
    heading.style.textAlign = "center";
    let deleteButton = document.createElement("button");
    deleteButton.innerText = "X";
    deleteButton.style.float = 'right';
    deleteButton.onclick = function () { this.closest('.graph_container').remove() };
    heading.appendChild(deleteButton);
    graphContainer.appendChild(heading);

    // Populate the Graph
    for (let i = 0; i < test.results.length; i++) {
        let barNumber = document.createElement("span");
        barNumber.classList.add("graph__bar__number");
        barNumber.innerText = test.results[i][0];
        graphContainer.appendChild(barNumber);

        barNumber = document.createElement("span");
        barNumber.classList.add("graph__bar__number");
        barNumber.innerText = test.results[i][1];
        graphContainer.appendChild(barNumber);

        barNumber = document.createElement("span");
        barNumber.classList.add("graph__bar__number");
        barNumber.innerText = Math.round(test.results[i][1] / samples * 100) / 100;
        graphContainer.appendChild(barNumber);

        let bar = document.createElement("span");
        bar.classList.add("graph__bar");
        bar.style.width = test.results[i][1] * 100 / samples + "%";
        graphContainer.appendChild(bar);
    }

    let graphBox = document.getElementById("graph_box");
    if (graphBox.scrollHeight - graphBox.clientHeight <= graphBox.scrollTop + 1) {
        setTimeout(function () {
            graphBox.scrollTop = graphBox.scrollHeight - graphBox.clientHeight;
        }, 5);
    }
    graphBox.prepend(graphContainer);
}

function distTest(roll, samples = 10000) {
    if (isNull(roll)) {
        return "Provide a roll please :)";
    }

    // Generate data - make the provided roll a number of times equal to sample size, then sort
    let rolls = [];
    for (let i = 0; i < samples; i++) {
        rolls.push(rollDice(roll));
    }
    rolls.sort();

    // Rearrange data into a frequency list: result -> frequency
    let a = [];
    let b = [];
    let previous = null;
    let results = [];
    for (let i = 0; i < rolls.length; i++) {
        if (rolls[i] !== previous) {
            results.push([rolls[i], 1]);
        } else {
            results[results.length - 1][1]++;
        }
        previous = rolls[i];
    }

    // Reverse sort?
    results.sort(function (a, b) {
        return a[0] - b[0];
    });

    // For the graph, we want to also have our frequencies as percentages (highest frequency is 1.0).
    let magnitude = 0;
    for (let i = 0; i < results.length; i++) {
        magnitude = results[i][1] > magnitude ? results[i][1] : magnitude;
    }

    for (let i = 0; i < results.length; i++) {
        results[i].push(results[i][1] / magnitude);
    }

    let test = {
        results: results,
        roll: roll,
        samples: samples
    }

    // Do this for some reason, I guess?
    for (let i = 0; i < results.length; i++) {
        let percent = Math.round(results[i][1] / samples * 10000, 5) / 100;
        let normalized = results[i][2];
    }


    console.log(magnitude);
    return test;
}


function roll(graph = false) {
    let input = document.getElementById("dice_input");

    if (graph) {
        makeGraph(input.value);
    } else {
        makeRoll(input.value);
    }
}

/**
 * Returns the result of a given dice roll.
 */
function rollDice(roll) {
    let keep = 0;
    let num = 0;
    let die = 0;
    let exp = 0;

    if (isNumeric(roll)) {
        return roll;
    }

    if (roll.search("e") !== -1) {
        roll = roll.split("e");
        exp = roll[1];
        if (isNull(exp) || num === "") {
            exp = 0;
        }
        roll = roll[0];
    }

    if (roll.search("d") !== -1) {
        roll = roll.split("d");
        num = roll[0];
        if (isNull(num) || num === "") {
            num = 1;
        }
        roll = roll[1];
    } else {
        num = 1;
    }


    if (roll.search("k") !== -1) {
        roll = roll.split("k");
        die = roll[0];
        keep = roll[1];
    } else {
        die = roll;
        keep = num;
    }

    if (isNull(keep) || keep === "") {
        keep = num;
    }

    keep = parseInt(keep, 10);
    num = parseInt(num, 10);

    total = 0;
    let rolls = [];

    // roll the dice
    for (let i = 0; i < num; i++) {
        rolls.push(randomInt(1, die));

        // check for explosions
        if (exp != 0) {
            let explodeDie = rolls[i];
            if (exp.search("\\+") !== -1) { // X and up...
                exp = parseInt(exp.split('\\+')[0], 10);
                while (explodeDie >= exp) {
                    explodeDie = randomInt(1, die);
                    rolls[i] += explodeDie;
                }
            } else if (exp.search("-") !== -1) { // X and below...
                exp = parseInt(exp.split('-')[0], 10);
                while (explodeDie <= exp) {
                    explodeDie = randomInt(1, die);
                    rolls[i] += explodeDie;
                }
            } else { // Just equal to X
                while (explodeDie == exp) {
                    explodeDie = randomInt(1, die);
                    rolls[i] += explodeDie;
                }
            }
        }

    }

    if (keep !== num) {
        if (0 < keep && keep < num) {
            // Keep dice
            rolls.sort(function (a, b) {
                return (a - b);
            });
        } else if (-num < keep && keep < 0) {
            // Drop dice
            rolls.sort(function (a, b) {
                return (b - a);
            });
        }
        rolls = rolls.slice(num - Math.abs(keep));
    }

    for (let i = 0; i < rolls.length; i++) {
        total += rolls[i];
    }

    return total;
}



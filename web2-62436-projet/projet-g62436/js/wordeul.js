"use strict";

/** Constantes globales */
const gameEL = document.querySelector("#game");
let ln = 0;
let col = 0;
// eslint-disable-next-line prefer-const
let targetWord = "";
let tiles = gameEL.querySelectorAll(".tile");
let rows = gameEL.querySelectorAll(".row");
let tilesInRow = tiles.length / rows.length;
// eslint-disable-next-line
let dict;

/**
 * @param {number} length entre 6 et 10
 * @param {string} firstLetter entre A et Z
 */
async function _getDict(length, firstLetter = null) {
    const project = "https://git.esi-bru.be/api/v4/projects/51440";
    const file = firstLetter ? `${length}.${firstLetter}` : `${length}`;
    return fetch(`${project}/repository/files/${file}/raw`)
        .then((r) => {
            if (!r.ok) {
                throw Error(`Code d'erreur du serveur ${r.status}`);
            }
            return r.text();
        })
        .then((r) => r.split("\n"))
        .catch((error) => console.error("Erreur pour récupérer le dictionnaire."));
}

_getDict(6).then((result) => {
    dict = result;
});

const keyboard = [
    "AZERTYUIOP".split(""),
    "QSDFGHJKLM".split(""),
    "1".split(""),
    "WXCVBN".split(""),
    "2".split(""),
];

/** Fonction qui permet de placer une lettre dans la case de la grille souhaitée
 * @param {number} ligne ligne dans laquelle on souhaite placer la lettre
 * @param {number} colonne colonne dans laquelle on souhaite placer la lettre
 * @param {String} lettre Lettre qui sera insérée dans la tuile souhaitée
*/
function setLetter(ligne, colonne, lettre) {
    rows[ligne].querySelectorAll(".tile")[colonne].textContent = lettre;
}

/** Fonction qui donne une action en fonction de la touche pressée
 * @param {String} key variable qui contiendra l'action qu'aura effectué le/la joueur/joueuse
*/
function keyUpHandler(key) {
    const liste = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    if (liste.includes(key) && col < tilesInRow) {
        console.log(key);
        setLetter(ln, col, key);
        col++;

    /** Si on appuie sur Backspace et qu'on ne se trouve
     pas dans la première case de la ligne */
    } else if (key === "BACKSPACE" && col > 0) {
        console.log("Backspacing"); // Débogage
        col--;
        setLetter(ln, col, "");

    /** Si on appuie sur Enter et que la constante de la
     current line c'est pas en dehors de la grille */
    } else if (key === "ENTER" && ln < rows.length) {
        ln++;
        col = 0;
        verification();
    }
}

/** Fonction qui permet de vérifier si les lettres placées par
 l'utilisateur sont correctes, à la mauvaise place ou absentes */
function verification() {
    if (!dict) {
        throw Error("Dictionnaire non chargé.");
    }
    /** constante qui donne les tuiles de la ligne actuelle */
    const currentTiles = rows[ln - 1].querySelectorAll(".tile");

    /**  constante de clé-valeurs qui permet de connaitre le nombre
     d'occurences dans le targetWord*/
    const occurrences = countOccurrences(targetWord);

    /** constante qui crée un tableau avec autant de false que de tiles.
     Permet de ne pas lire deux fois la même lettre dans la deuxième boucle*/
    const checked = Array(tilesInRow).fill(false);
    let tilesWord = "";
    for (let i = 0; i < tilesInRow; i++) {
        tilesWord += rows[ln - 1].querySelectorAll(".tile")[i].textContent;
    }
    if (!estDansLeDictionnaire(tilesWord) || tilesWord === "") {
        console.log(`Mot non trouvé dans le dictionnaire: ${tilesWord}`);
        notFoundAnimation();
        for (let i = 0; i < tilesInRow; i++) {
            rows[ln - 1].querySelectorAll(".tile")[i].textContent = "";
        }
        ln--;
    } else {
        for (let i = 0; i < tilesInRow; i++) {
            const currentLetter = currentTiles[i].textContent;
            if (targetWord[i] === currentTiles[i].textContent) {
                currentTiles[i].classList.add("correct");
                mettreEnVert(currentTiles[i].textContent);
                console.log(currentTiles[i].textContent, " est correct");
                occurrences[currentLetter]--;
                checked[i] = true;
            }
        }
        for (let i = 0; i < tilesInRow; i++) {
            const currentLetter = currentTiles[i].textContent;

            if (!checked[i] && currentLetter in occurrences && occurrences[currentLetter] > 0) {
                currentTiles[i].classList.add("present");
                mettreEnJaune(currentTiles[i].textContent);
                occurrences[currentLetter]--;
                console.log(currentTiles[i].textContent, " est présent");
            } else if (!checked[i]) {
                currentTiles[i].classList.add("absent");
                console.log(currentLetter, " est absent");
            }
        }
        if (tilesWord === targetWord) {
            console.log(tilesWord);
            showModal();
        } else if (!(tilesWord === targetWord) && ln === rows.length) {
            showModalLose();
        }
    }
}

/**  Fonction qui permet de retourner un dictionnaire avec
 * le nombre d'occurences pour chaque lettre du targetWord
 * @param {String} word Le mot que le joueur/joueuse devra deviner
 */
function countOccurrences(word) {
    const occurrences = {};
    for (const letter of word) {
        occurrences[letter] = (occurrences[letter] || 0) + 1;
    }
    return occurrences;
}

/** Fonction qui change le contenu du modal */
function showModalLose() {
    document.querySelector("#result").textContent = "Vous avez perdu";
    document.querySelector("#libelle").textContent = `Le mot à deviner était : ${targetWord}`;
    showModal();
}

/**
 * @param {number} nT nombre de tentatives
 * @param {number} lM longueur du mot à deviner
 */
function createGrid(nT, lM) {
    for (let i = 0; i < nT; i++) {
        const row = document.createElement("div");
        row.classList.add("row");

        for (let j = 0; j < lM; j++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            row.appendChild(tile);
        }

        gameEL.appendChild(row);
    }
    tiles = gameEL.querySelectorAll(".tile");
    rows = gameEL.querySelectorAll(".row");
    tilesInRow = tiles.length / rows.length;
}

function generateKeyboard() {
    const keyboardContainer = document.querySelector("#keyboard");

    // Parcourir le tableau keyboard
    keyboard.forEach((row) => {
        const rowElement = document.createElement("div");
        rowElement.classList.add("keyboard-row");

        row.forEach((key) => {
            const keyElement = document.createElement("button");
            if (key === "1") {
                keyElement.textContent = "RETURN";
                keyElement.classList.add("enter");
            } else if (key === "2") {
                keyElement.textContent = "BACKSPACE";
                keyElement.classList.add("backspace");
            } else {
                keyElement.textContent = key;
            }
            keyElement.classList.add("keyboard-key");
            keyElement.addEventListener("click", () => {
                handleKeyClick(key);
            });

            rowElement.appendChild(keyElement);
        });

        keyboardContainer.appendChild(rowElement);
    });
}

function handleKeyClick(key) {
    let changement = "";
    if (key === "1") {
        changement = "ENTER";
        keyUpHandler(changement);
    } else if (key === "2") {
        changement = "BACKSPACE";
        keyUpHandler(changement);
    } else {
        keyUpHandler(key);
    }
}

/**
 * @param {number} nT nombre de tentatives
 * @param {string} tW le mot cible à deviner
 */
function initGame(nT, tW) {
    const twLength = tW.length;
    //je rajoute un parseInt() pour être sur que la variable contient un nombre
    createGrid(nT, twLength);
    generateKeyboard();
    // @ts-ignore
    gameEL.style.visibility = "visible";
}

/**
 * @param {string} mot le mot à vérifier s'il se trouve dans le dictionnaire
 */
function estDansLeDictionnaire(mot) {
    return dict.includes(mot);
}

function notFoundAnimation() {
    gameEL.classList.add("notFound");
    gameEL.addEventListener("animationend", () => {
        gameEL.classList.remove("notFound");
    });
}

function gameEnd() {
    // @ts-ignore
    formulaire.style.visibility = "visible";
    // @ts-ignore
    gameEL.style.visibility = "hidden";
    gameEL.innerHTML = "";
    document.querySelector("#keyboard").innerHTML = "";
    document.querySelector("#ad").classList.remove("right");
    ln = 0;
}

function mettreEnVert(letter) {
    const buttons = document.querySelectorAll(".keyboard-key");
    buttons.forEach((button) => {
        if (button.textContent === letter) {
            // @ts-ignore
            button.classList.add("correct");
        }
    });
}

function mettreEnJaune(letter) {
    const buttons = document.querySelectorAll(".keyboard-key");
    buttons.forEach((button) => {
        if (button.textContent === letter) {
            // @ts-ignore
            button.classList.add("present");
        }
    });
}
/** Top-level code */
document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("keydown", (e) => {
        const lettre = e.key.toUpperCase();
        keyUpHandler(lettre);
        console.log(lettre);
    });
});

"use strict";

function showModal() {
    // @ts-ignore
    document.querySelector(".modal").style.visibility = "visible";
}

function hideModal() {
    // @ts-ignore
    document.querySelector(".modal").style.visibility = "hidden";
}

/** Fonction qui empêche la fermeture du modal si on appuie sur la fenêtre
 * @param {*} event aucune valeur ne sera insérée dans cette variable
 */
function stopPropagation(event) {
    event.stopPropagation();
}

document.querySelector("#closeBtn").addEventListener("click", () => {
    hideModal();
    gameEnd();
});
document.querySelector(".modal").addEventListener("click", () => {
    hideModal();
    gameEnd();
});
document.querySelector(".modal-dialog").addEventListener("click", stopPropagation);

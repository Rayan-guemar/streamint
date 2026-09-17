const formulaire = document.querySelector("#formulaire");
const champCode = document.querySelector("#code");
const message = document.querySelector("#message");
function afficherMessage(texte, classeCSS) {
  message.textContent = texte;
  message.className = classeCSS;
}
formulaire.addEventListener("submit", function (evenement) {
  evenement.preventDefault();

  const code = champCode.value.trim().toUpperCase();
  champCode.value = code;
  if (code === "") {
    afficherMessage(
  "Le code doit contenir 8 caractères.",
  "message-erreur"
);
    return;
  }

  if (code.length !== 8) {
    afficherMessage(
  "Le code doit contenir 8 caractères.",
  "message-erreur"
);
    message.className = "message-erreur";
    return;
  }
const caracteresAutorises = /^[A-Z0-9]+$/;

if (!caracteresAutorises.test(code)) {
  afficherMessage(
      "Utilise uniquement des lettres et des chiffres.",
      "message-erreur"
    );
    return;
  }

  afficherMessage(
    "Format du code valide : " + code,
    "message-valide"
  );
});
champCode.addEventListener("input", function () {
  afficherMessage("", "");
});
const lecteur = document.querySelector("#lecteur");
const boutonLecture = document.querySelector("#bouton-lecture");

boutonLecture.addEventListener("click", function () {
  lecteur.play();
});
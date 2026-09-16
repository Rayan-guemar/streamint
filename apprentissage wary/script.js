const formulaire = document.querySelector("#formulaire");
const champCode = document.querySelector("#code");
const message = document.querySelector("#message");

formulaire.addEventListener("submit", function (evenement) {
  evenement.preventDefault();

  const code = champCode.value.trim().toUpperCase();
  champCode.value = code;
  if (code === "") {
    message.textContent = "Entre un code de séance.";
    message.className = "message-erreur";
    return;
  }

  if (code.length !== 8) {
    message.textContent = "Le code doit contenir 8 caractères.";
    message.className = "message-erreur";
    return;
  }
const caracteresAutorises = /^[A-Z0-9]+$/;

if (!caracteresAutorises.test(code)) {
  message.textContent = "Utilise uniquement des lettres et des chiffres.";
  message.className = "message-erreur";
  return;
}
  message.textContent = "Code demandé : " + code;
  message.className = "message-valide";
});
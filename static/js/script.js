const formulaire = document.querySelector("#formulaire");
const champCode = document.querySelector("#code");
const message = document.querySelector("#message");
const accueil = document.querySelector("#accueil");
const salle = document.querySelector("#salle");
const codeAffiche = document.querySelector("#code-affiche");
const boutonQuitter = document.querySelector("#bouton-quitter");

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
      "Entre un code de séance.",
      "message-erreur"
    );
    return;
  }

  if (code.length !== 8) {
    afficherMessage(
      "Le code doit contenir 8 caractères.",
      "message-erreur"
    );
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

  if (code !== "DEMO2026") {
    afficherMessage(
      "Pour cette démonstration, utilise le code DEMO2026.",
      "message-erreur"
    );
    return;
  }

  codeAffiche.textContent = code;
  titreSalle.textContent = "Séance de démonstration";

  afficherParticipants([
    { nom: "Marine", organisateur: true },
    { nom: "Warren", organisateur: false },
    { nom: "Rayan", organisateur: false }
  ]);

  accueil.hidden = true;
  salle.hidden = false;

  afficherMessage("", "");
});
champCode.addEventListener("input", function () {
  afficherMessage("", "");
});


const lecteur = document.querySelector("#lecteur");

const boutonLecture =
  document.querySelector("#bouton-lecture");

const boutonReculer =
  document.querySelector("#bouton-reculer");

const boutonAvancer =
  document.querySelector("#bouton-avancer");

const tempsLecture =
  document.querySelector("#temps-lecture");

const progression =
  document.querySelector("#progression");

const etatVideo =
  document.querySelector("#etat-video");


function videoEstPrete() {
  return (
    lecteur.readyState >= 1 &&
    Number.isFinite(lecteur.duration) &&
    lecteur.duration > 0 &&
    lecteur.error === null
  );
}


function formaterTemps(temps) {
  if (!Number.isFinite(temps) || temps < 0) {
    return "0:00";
  }

  const minutes = Math.floor(temps / 60);
  const secondes = Math.floor(temps % 60);

  const secondesFormatees =
    String(secondes).padStart(2, "0");

  return minutes + ":" + secondesFormatees;
}


function actualiserTemps() {
  const position = formaterTemps(lecteur.currentTime);

  if (!videoEstPrete()) {
    tempsLecture.textContent = position + " / --:--";
    progression.disabled = true;
    return;
  }

  const duree = formaterTemps(lecteur.duration);

  tempsLecture.textContent = position + " / " + duree;

  progression.disabled = false;
  progression.max = lecteur.duration;
  progression.value = lecteur.currentTime;
}


function actualiserDisponibilite() {
  const prete = videoEstPrete();

  boutonLecture.disabled = !prete;
  boutonReculer.disabled = !prete;
  boutonAvancer.disabled = !prete;
  progression.disabled = !prete;

  if (lecteur.error !== null) {
    etatVideo.textContent =
      "Impossible de lire la vidéo. Vérifie le fichier videos/test.mp4.";
  } else if (prete) {
    etatVideo.textContent = "Vidéo prête.";
  } else {
    etatVideo.textContent = "Chargement de la vidéo…";
  }

  actualiserTemps();
}


boutonLecture.addEventListener("click", function () {
  if (!videoEstPrete()) {
    return;
  }

  if (lecteur.paused) {
    if (lecteur.ended) {
      lecteur.currentTime = 0;
    }

    lecteur.play().catch(function () {
      etatVideo.textContent =
        "La lecture n’a pas démarré. Réessaie.";
    });
  } else {
    lecteur.pause();
  }
});


boutonAvancer.addEventListener("click", function () {
  if (!videoEstPrete()) {
    return;
  }

  const nouvellePosition = lecteur.currentTime + 10;

  lecteur.currentTime = Math.min(
    nouvellePosition,
    lecteur.duration
  );

  actualiserTemps();
});

boutonReculer.addEventListener("click", function () {
  if (!videoEstPrete()) {
    return;
  }

  const nouvellePosition = lecteur.currentTime - 10;

  lecteur.currentTime = Math.max(nouvellePosition, 0);

  actualiserTemps();
});


progression.addEventListener("input", function () {
  if (!videoEstPrete()) {
    return;
  }

  lecteur.currentTime = Number(progression.value);

  actualiserTemps();
});


lecteur.addEventListener("timeupdate", actualiserTemps);

lecteur.addEventListener(
  "loadedmetadata",
  actualiserDisponibilite
);

lecteur.addEventListener(
  "durationchange",
  actualiserDisponibilite
);

lecteur.addEventListener(
  "emptied",
  actualiserDisponibilite
);

lecteur.addEventListener(
  "error",
  actualiserDisponibilite
);
const sourceVideo = lecteur.querySelector("source");

sourceVideo.addEventListener("error", function () {
  boutonLecture.disabled = true;
  boutonReculer.disabled = true;
  boutonAvancer.disabled = true;
  progression.disabled = true;

  etatVideo.textContent =
    "Fichier vidéo introuvable ou illisible : vérifie videos/test.mp4.";
});


actualiserDisponibilite();
const volume = document.querySelector("#volume");
const boutonMuet = document.querySelector("#bouton-muet");
volume.addEventListener("input", function () {
  lecteur.muted = false;
  lecteur.volume = Number(volume.value);
});
boutonMuet.addEventListener("click", function () {
  lecteur.muted = !lecteur.muted;
});
function actualiserVolume() {
  if (lecteur.muted) {
    volume.value = 0;
    boutonMuet.textContent = "Rétablir le son";
  } else {
    volume.value = lecteur.volume;
    boutonMuet.textContent = "Couper le son";
  }
}

lecteur.addEventListener("volumechange", actualiserVolume);

actualiserVolume();
function actualiserBoutonLecture() {
  if (lecteur.paused) {
    boutonLecture.textContent = "Lecture";
  } else {
    boutonLecture.textContent = "Pause";
  }
}

lecteur.addEventListener("play", actualiserBoutonLecture);
lecteur.addEventListener("pause", actualiserBoutonLecture);
lecteur.addEventListener("ended", actualiserBoutonLecture);

actualiserBoutonLecture();
boutonQuitter.addEventListener("click", function () {
  lecteur.pause();

  salle.hidden = true;
  accueil.hidden = false;

  champCode.focus();
});
const formulaireCreation =
  document.querySelector("#formulaire-creation");

const nomSeance = document.querySelector("#nom-seance");
const fichierVideo = document.querySelector("#fichier-video");
const titreSalle = document.querySelector("#titre-salle");
const messageCreation = document.querySelector("#message-creation");

let adresseVideoLocale = null;

formulaireCreation.addEventListener("submit", function (evenement) {
  evenement.preventDefault();

  const nom = nomSeance.value.trim();
  const fichier = fichierVideo.files[0];

  if (nom === "") {
    messageCreation.textContent = "Donne un nom à ta séance.";
    return;
  }

  if (!fichier) {
    messageCreation.textContent = "Choisis une vidéo.";
    return;
  }

  lecteur.pause();
  if (adresseVideoLocale !== null) {
    URL.revokeObjectURL(adresseVideoLocale);
  }

  adresseVideoLocale = URL.createObjectURL(fichier);
  sourceVideo.src = adresseVideoLocale;
  sourceVideo.type = fichier.type;
  lecteur.load();

  titreSalle.textContent = nom;
  afficherParticipants([
    { nom: "Warren", organisateur: true },
    { nom: "Marine", organisateur: false },
    { nom: "Rayan", organisateur: false }
  ]);
  codeAffiche.textContent = "DEMO2026";
  messageCreation.textContent = "";

  accueil.hidden = true;
  salle.hidden = false;
  boutonQuitter.focus();
});
const boutonCopier = document.querySelector("#bouton-copier");
const messageCopie = document.querySelector("#message-copie");

const boutonPleinEcran =
  document.querySelector("#bouton-plein-ecran");

boutonCopier.addEventListener("click", function () {
  const code = codeAffiche.textContent;
  if (!navigator.clipboard) {
    messageCopie.textContent = "Code à copier manuellement : " + code;
    return;
  }

  navigator.clipboard.writeText(code)
    .then(function () {
      messageCopie.textContent = "Code copié.";
    })
    .catch(function () {
      messageCopie.textContent =
        "Copie automatique impossible. Code à copier : " + code;
    });
});

boutonPleinEcran.addEventListener("click", function () {
  if (!lecteur.requestFullscreen) {
    etatVideo.textContent =
      "Le plein écran n’est pas disponible dans ce navigateur.";
    return;
  }

  lecteur.requestFullscreen().catch(function () {
    etatVideo.textContent =
      "Le navigateur n’a pas autorisé le plein écran.";
  });
});
const listeParticipants = document.querySelector("#liste-participants");
const nombreParticipants = document.querySelector("#nombre-participants");

function afficherParticipants(participants) {
  listeParticipants.replaceChildren();

  nombreParticipants.textContent =
    participants.length + " participant(s)";

  participants.forEach(function (participant) {
    const ligne = document.createElement("li");
    const nom = document.createElement("span");
    const role = document.createElement("span");

    nom.textContent = participant.nom;
    role.className = "role-participant";

    if (participant.organisateur) {
      role.textContent = "Organisateur";
    } else {
      role.textContent = "Invité";
    }

    ligne.append(nom, role);
    listeParticipants.append(ligne);
  });
}
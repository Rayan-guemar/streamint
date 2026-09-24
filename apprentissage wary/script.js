// ========================================
// 1. Récupérer les éléments du formulaire
// ========================================

const formulaire = document.querySelector("#formulaire");
const champCode = document.querySelector("#code");
const message = document.querySelector("#message");


// ========================================
// 2. Afficher un message
// ========================================

function afficherMessage(texte, classeCSS) {
  message.textContent = texte;
  message.className = classeCSS;
}


// ========================================
// 3. Vérifier le code de séance
// ========================================

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

  afficherMessage(
    "Format du code valide : " + code,
    "message-valide"
  );
});


// Effacer le résultat précédent quand la saisie change.

champCode.addEventListener("input", function () {
  afficherMessage("", "");
});


// ========================================
// 4. Récupérer les éléments du lecteur
// ========================================

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


// ========================================
// 5. Vérifier si la vidéo est prête
// ========================================

function videoEstPrete() {
  return (
    lecteur.readyState >= 1 &&
    Number.isFinite(lecteur.duration) &&
    lecteur.duration > 0 &&
    lecteur.error === null
  );
}


// ========================================
// 6. Transformer les secondes en minutes
// ========================================

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


// ========================================
// 7. Actualiser le temps et le curseur
// ========================================

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


// ========================================
// 8. Activer ou désactiver les commandes
// ========================================

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


// ========================================
// 9. Lecture et pause
// ========================================

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


// ========================================
// 10. Avancer et reculer
// ========================================

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


// ========================================
// 11. Déplacer la vidéo avec le curseur
// ========================================

progression.addEventListener("input", function () {
  if (!videoEstPrete()) {
    return;
  }

  lecteur.currentTime = Number(progression.value);

  actualiserTemps();
});


// ========================================
// 12. Suivre les événements du lecteur
// ========================================

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

// Certains échecs de chargement concernent l’élément source.
const sourceVideo = lecteur.querySelector("source");

sourceVideo.addEventListener("error", function () {
  boutonLecture.disabled = true;
  boutonReculer.disabled = true;
  boutonAvancer.disabled = true;
  progression.disabled = true;

  etatVideo.textContent =
    "Fichier vidéo introuvable ou illisible : vérifie videos/test.mp4.";
});


// ========================================
// 13. Initialiser l’affichage
// ========================================

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
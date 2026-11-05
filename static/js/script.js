const formulaire = document.querySelector("#formulaire");
const champCode = document.querySelector("#code");
const message = document.querySelector("#message");

const lecteur = document.querySelector("#lecteur");
const boutonLecture = document.querySelector("#bouton-lecture");
const boutonReculer = document.querySelector("#bouton-reculer");
const boutonAvancer = document.querySelector("#bouton-avancer");
const tempsLecture = document.querySelector("#temps-lecture");
const progression = document.querySelector("#progression");
const etatVideo = document.querySelector("#etat-video");
const volume = document.querySelector("#volume");
const boutonMuet = document.querySelector("#bouton-muet");
const boutonPleinEcran = document.querySelector("#bouton-plein-ecran");
const boutonCopier = document.querySelector("#bouton-copier");
const messageCopie = document.querySelector("#message-copie");
const codeAffiche = document.querySelector("#code-affiche");
const boutonQuitter = document.querySelector("#bouton-quitter");
const listeParticipants = document.querySelector("#liste-participants");
const nombreParticipants = document.querySelector("#nombre-participants");

function videoEstPrete() {
  return (
    lecteur &&
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
  return minutes + ":" + String(secondes).padStart(2, "0");
}

function actualiserTemps() {
  if (!tempsLecture || !progression || !lecteur) return;
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

  if (boutonLecture) boutonLecture.disabled = !prete;
  if (boutonReculer) boutonReculer.disabled = !prete;
  if (boutonAvancer) boutonAvancer.disabled = !prete;
  if (progression) progression.disabled = !prete;

  if (etatVideo) {
    if (lecteur && lecteur.error !== null) {
      etatVideo.textContent = "Impossible de lire la vidéo.";
    } else if (prete) {
      etatVideo.textContent = "Vidéo prête.";
    } else {
      etatVideo.textContent = "Chargement de la vidéo…";
    }
  }

  actualiserTemps();
}

function actualiserBoutonLecture() {
  if (!boutonLecture || !lecteur) return;
  boutonLecture.textContent = lecteur.paused ? "Lecture" : "Pause";
}

function actualiserVolume() {
  if (!volume || !boutonMuet || !lecteur) return;
  if (lecteur.muted) {
    volume.value = 0;
    boutonMuet.textContent = "Rétablir le son";
  } else {
    volume.value = lecteur.volume;
    boutonMuet.textContent = "Couper le son";
  }
}

function afficherParticipants(participants) {
  if (!listeParticipants || !nombreParticipants) return;
  listeParticipants.replaceChildren();
  nombreParticipants.textContent = participants.length + " participant(s)";

  participants.forEach(function (participant) {
    const ligne = document.createElement("li");
    const nom = document.createElement("span");
    const role = document.createElement("span");

    nom.textContent = participant.nom;
    role.className = "role-participant";
    role.textContent = participant.organisateur ? "Organisateur" : "Invité";

    ligne.append(nom, role);
    listeParticipants.append(ligne);
  });
}

function afficherMessage(texte, classeCSS) {
  if (!message) return;
  message.textContent = texte;
  message.className = classeCSS;
}

if (formulaire && champCode) {
  formulaire.addEventListener("submit", function (evenement) {
    evenement.preventDefault();
    const code = champCode.value.trim().toUpperCase();
    champCode.value = code;

    if (code === "") {
      afficherMessage("Entre un code de séance.", "message-erreur");
      return;
    }

    if (code.length !== 8) {
      afficherMessage("Le code doit contenir 8 caractères.", "message-erreur");
      return;
    }

    const caracteresAutorises = /^[A-Z0-9]+$/;
    if (!caracteresAutorises.test(code)) {
      afficherMessage("Utilise uniquement des lettres et des chiffres.", "message-erreur");
      return;
    }

    window.location.href = `/rooms/${code}/`;
  });

  champCode.addEventListener("input", function () {
    afficherMessage("", "");
  });
}

if (lecteur) {
  if (boutonLecture) {
    boutonLecture.addEventListener("click", function () {
      if (!videoEstPrete()) return;
      if (lecteur.paused) {
        if (lecteur.ended) lecteur.currentTime = 0;
        lecteur.play();
      } else {
        lecteur.pause();
      }
    });
  }

  if (boutonAvancer) {
    boutonAvancer.addEventListener("click", function () {
      if (!videoEstPrete()) return;
      lecteur.currentTime = Math.min(lecteur.currentTime + 10, lecteur.duration);
      actualiserTemps();
    });
  }

  if (boutonReculer) {
    boutonReculer.addEventListener("click", function () {
      if (!videoEstPrete()) return;
      lecteur.currentTime = Math.max(lecteur.currentTime - 10, 0);
      actualiserTemps();
    });
  }

  if (progression) {
    progression.addEventListener("input", function () {
      if (!videoEstPrete()) return;
      lecteur.currentTime = Number(progression.value);
      actualiserTemps();
    });
  }

  if (volume) {
    volume.addEventListener("input", function () {
      lecteur.muted = false;
      lecteur.volume = Number(volume.value);
    });
  }

  if (boutonMuet) {
    boutonMuet.addEventListener("click", function () {
      lecteur.muted = !lecteur.muted;
    });
  }

  if (boutonPleinEcran) {
    boutonPleinEcran.addEventListener("click", function () {
      if (lecteur.requestFullscreen) {
        lecteur.requestFullscreen();
      }
    });
  }

  lecteur.addEventListener("timeupdate", actualiserTemps);
  lecteur.addEventListener("loadedmetadata", actualiserDisponibilite);
  lecteur.addEventListener("durationchange", actualiserDisponibilite);
  lecteur.addEventListener("canplay", actualiserDisponibilite);
  lecteur.addEventListener("emptied", actualiserDisponibilite);
  lecteur.addEventListener("error", actualiserDisponibilite);
  lecteur.addEventListener("play", actualiserBoutonLecture);
  lecteur.addEventListener("pause", actualiserBoutonLecture);
  lecteur.addEventListener("ended", actualiserBoutonLecture);
  lecteur.addEventListener("volumechange", actualiserVolume);

  actualiserDisponibilite();
  actualiserBoutonLecture();
  actualiserVolume();
}

if (boutonCopier && codeAffiche) {
  boutonCopier.addEventListener("click", function () {
    const code = codeAffiche.textContent;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(function () {
        if (messageCopie) messageCopie.textContent = "Code copié.";
      });
    }
  });
}

if (boutonQuitter) {
  boutonQuitter.addEventListener("click", function () {
    if (lecteur) lecteur.pause();
    window.location.href = "/";
  });
}


if (formulaire && champCode) {

  formulaire.addEventListener("submit", function (evenement) {

    evenement.preventDefault();

    const code = champCode.value.trim().toUpperCase();

    if (code) {
      window.location.href = "/rooms/" + code;
    }

  });

}
/* =========================================================
   CONFIGURATION — à adapter
   ========================================================= */
const CONFIG = {
  // Date & heure de la cérémonie (heure de Paris)
  weddingDate: "2027-07-08T14:30:00+02:00",

  // URL du script Google Apps Script (voir apps-script/Code.gs et README).
  // Laisser vide : les réponses seront envoyées par e-mail (mailto) à fallbackEmail.
  endpoint: "",

  fallbackEmail: "contact@exemple.fr",
};

document.documentElement.classList.add("js");

/* ---------- Navigation : fond au scroll ---------- */
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Apparitions ---------- */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

/* ---------- Compte à rebours ---------- */
(function countdown() {
  const target = new Date(CONFIG.weddingDate).getTime();
  const box = document.getElementById("countdown");
  const out = {
    d: box.querySelector('[data-cd="d"]'),
    h: box.querySelector('[data-cd="h"]'),
    m: box.querySelector('[data-cd="m"]'),
  };
  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      box.innerHTML = '<p class="script" style="font-size:2.4rem;color:var(--terracotta);margin:0">C’est le grand jour</p>';
      return;
    }
    out.d.textContent = Math.floor(diff / 864e5);
    out.h.textContent = String(Math.floor((diff % 864e5) / 36e5)).padStart(2, "0");
    out.m.textContent = String(Math.floor((diff % 36e5) / 6e4)).padStart(2, "0");
    setTimeout(tick, 30000);
  };
  tick();
})();

/* ---------- RSVP ---------- */
const form = document.getElementById("rsvp-form");
const errorBox = document.getElementById("form-error");
const submitBtn = document.getElementById("rsvp-submit");
const thanks = document.getElementById("thanks");
const thanksText = document.getElementById("thanks-text");

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = !msg;
}

function validate() {
  let ok = true;
  form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));

  ["nom", "email"].forEach((name) => {
    const input = form.elements[name];
    if (!input.value.trim() || (name === "email" && !input.checkValidity())) {
      input.closest(".field").classList.add("is-invalid");
      ok = false;
    }
  });

  ["mairie", "soiree", "brunch"].forEach((name) => {
    if (!form.querySelector(`input[name="${name}"]:checked`)) {
      form.querySelector(`[data-group="${name}"]`).classList.add("is-invalid");
      ok = false;
    }
  });

  return ok;
}

form.addEventListener("change", () => {
  form.querySelectorAll(".is-invalid").forEach((el) => {
    const filled = el.matches(".attend__row")
      ? el.querySelector("input:checked")
      : el.querySelector("input")?.value.trim();
    if (filled) el.classList.remove("is-invalid");
  });
  if (!form.querySelector(".is-invalid")) showError("");
});

function buildThanks(data) {
  const yes = [];
  if (data.mairie === "Oui") yes.push("la mairie");
  if (data.soiree === "Oui") yes.push("la soirée");
  if (data.brunch === "Oui") yes.push("le brunch");
  if (!yes.length) return "Vous nous manquerez ! Merci d’avoir pris le temps de nous répondre.";
  const list = yes.length > 1 ? yes.slice(0, -1).join(", ") + " et " + yes.at(-1) : yes[0];
  return `Nous avons hâte de vous retrouver pour ${list}.`;
}

function sendByMail(data) {
  const body = [
    `Nom : ${data.nom}`,
    `E-mail : ${data.email}`,
    `Nombre de personnes : ${data.personnes}`,
    `Accompagnants : ${data.accompagnants || "-"}`,
    `Mairie : ${data.mairie}`,
    `Soirée : ${data.soiree}`,
    `Brunch : ${data.brunch}`,
    `Régime / allergies : ${data.regime || "-"}`,
    `Message : ${data.message || "-"}`,
  ].join("\n");
  window.location.href =
    `mailto:${CONFIG.fallbackEmail}?subject=${encodeURIComponent("RSVP mariage — " + data.nom)}&body=${encodeURIComponent(body)}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (form.elements.website.value) return; // robot

  if (!validate()) {
    showError("Merci de renseigner votre nom, votre e-mail et votre présence pour chaque moment.");
    form.querySelector(".is-invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  showError("");

  const data = Object.fromEntries(new FormData(form).entries());
  delete data.website;
  data.date = new Date().toISOString();

  submitBtn.disabled = true;
  submitBtn.textContent = "Envoi en cours…";

  try {
    if (CONFIG.endpoint) {
      await fetch(CONFIG.endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString(),
      });
    } else {
      sendByMail(data);
    }
    thanksText.textContent = buildThanks(data);
    form.hidden = true;
    thanks.hidden = false;
    thanks.focus();
    thanks.scrollIntoView({ behavior: "smooth", block: "center" });
    form.reset();
  } catch (err) {
    showError("Oups, l’envoi n’a pas fonctionné. Vérifiez votre connexion et réessayez.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Envoyer ma réponse";
  }
});

document.getElementById("rsvp-again").addEventListener("click", () => {
  thanks.hidden = true;
  form.hidden = false;
  form.elements.nom.focus();
});

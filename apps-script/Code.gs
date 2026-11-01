/**
 * Réception des réponses RSVP dans une Google Sheet.
 * Mode d'emploi : voir README.md (section « Recevoir les réponses »).
 */

const SHEET_NAME = "Réponses";
const COLUMNS = [
  "date", "nom", "email", "personnes", "accompagnants",
  "mairie", "soiree", "brunch", "regime", "message",
];
const HEADERS = [
  "Date", "Nom", "E-mail", "Nb personnes", "Accompagnants",
  "Mairie", "Soirée", "Brunch", "Régime / allergies", "Message",
];

// Facultatif : recevoir un e-mail à chaque réponse (laisser vide pour désactiver)
const NOTIFY_EMAIL = "";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    }

    const p = e.parameter || {};
    const row = COLUMNS.map((c) => (c === "date" ? new Date() : String(p[c] || "").slice(0, 1000)));
    sheet.appendRow(row);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(
        NOTIFY_EMAIL,
        "Nouvelle réponse RSVP — " + (p.nom || ""),
        HEADERS.map((h, i) => h + " : " + row[i]).join("\n")
      );
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

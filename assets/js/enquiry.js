// Enquiry form → posts to Google Sheets (via Apps Script web app) AND opens WhatsApp.
//
// SETUP — paste your Apps Script Web App URL below (the one ending in /exec).
// Until this is filled in, the form still works: it just skips the sheet write
// and goes straight to WhatsApp, so nothing breaks if the endpoint isn't ready.
const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycby2-NnARyFvb3C8QZNXPm17roXd8AR9CT8xz_QtRIZ0Uupw2VWWuwVitzBNOYF1rU3kZQ/exec';

// We send the request as text/plain so the browser doesn't issue a CORS
// preflight (Apps Script web apps don't reply to OPTIONS). Apps Script reads
// the raw body via e.postData.contents and parses it as JSON.
function postToSheet(payload) {
  if (!SHEETS_ENDPOINT || SHEETS_ENDPOINT.startsWith('PASTE_')) return Promise.resolve();
  return fetch(SHEETS_ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

function submitEnquiry() {
  const name = document.getElementById('fname').value.trim();
  const phone = document.getElementById('fphone').value.trim();
  const email = document.getElementById('femail').value.trim();
  const product = document.getElementById('fproduct').value;
  const showroom = document.getElementById('fshowroom').value;
  const message = document.getElementById('fmessage').value.trim();
  const authorize = document.getElementById('fauthorize').checked;

  if (!name || !phone) {
    alert('Please enter your name and phone number.');
    return;
  }
  if (!authorize) {
    alert('Please authorize Fairdeal to send notifications via SMS / RCS / Call / Email / Whatsapp to continue.');
    return;
  }

  const payload = {
    name, phone, email, product, showroom, message,
    authorize: !!authorize,
    source: 'Website Enquiry Form',
    page: location.href,
    submittedAt: new Date().toISOString(),
  };

  // Fire-and-forget the sheet write; don't block WhatsApp open.
  postToSheet(payload);

  let text = 'Hi Fairdeal! I would like to enquire about a product.\n\n';
  text += `*Name:* ${name}\n`;
  text += `*Phone:* ${phone}\n`;
  if (email)    text += `*Email:* ${email}\n`;
  if (product)  text += `*Interested in:* ${product}\n`;
  if (showroom) text += `*Preferred showroom:* ${showroom}\n`;
  if (message)  text += `*Message:* ${message}\n`;

  window.open(`https://wa.me/917003364494?text=${encodeURIComponent(text)}`, '_blank');
}

window.submitEnquiry = submitEnquiry;

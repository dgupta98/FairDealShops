// Enquiry form → WhatsApp deep-link.
// The form's submit handler is set inline as onclick="submitEnquiry()"; we attach
// the implementation to window so the markup keeps working without rewiring.

function submitEnquiry() {
  const name = document.getElementById('fname').value.trim();
  const phone = document.getElementById('fphone').value.trim();
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

  let text = 'Hi Fairdeal! I would like to enquire about a product.\n\n';
  text += `*Name:* ${name}\n`;
  text += `*Phone:* ${phone}\n`;
  if (product)  text += `*Interested in:* ${product}\n`;
  if (showroom) text += `*Preferred showroom:* ${showroom}\n`;
  if (message)  text += `*Message:* ${message}\n`;

  window.open(`https://wa.me/917003364494?text=${encodeURIComponent(text)}`, '_blank');
}

window.submitEnquiry = submitEnquiry;

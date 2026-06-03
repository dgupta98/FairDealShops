// Enquiry form → WhatsApp deep-link.
// The form's submit handler is set inline as onclick="submitEnquiry()"; we attach
// the implementation to window so the markup keeps working without rewiring.

function submitEnquiry() {
  const name = document.getElementById('fname').value.trim();
  const phone = document.getElementById('fphone').value.trim();
  const product = document.getElementById('fproduct').value;
  const showroom = document.getElementById('fshowroom').value;
  const message = document.getElementById('fmessage').value.trim();
  const wa = document.getElementById('fwhatsapp').checked;

  if (!name || !phone) {
    alert('Please enter your name and phone number.');
    return;
  }

  let text = 'Hi Fairdeal! I would like to enquire about a product.\n\n';
  text += `*Name:* ${name}\n`;
  text += `*Phone:* ${phone}\n`;
  if (product)  text += `*Interested in:* ${product}\n`;
  if (showroom) text += `*Preferred showroom:* ${showroom}\n`;
  if (message)  text += `*Message:* ${message}\n`;
  if (wa)       text += '\n_(I agree to receive updates on WhatsApp)_';

  window.open(`https://wa.me/917003364494?text=${encodeURIComponent(text)}`, '_blank');
}

window.submitEnquiry = submitEnquiry;

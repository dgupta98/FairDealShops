// Showroom finder — six tabbed locations with map embed swap.
const SHOWROOMS = [
  {
    name: 'Behala',
    addr: 'No. 1 Sourin Roy Road, Behala Tram Depot, Kolkata 700 034',
    phone: 'tel:+919051812244',
    phoneDisp: '9051 812 244',
    map: 'https://maps.app.goo.gl/iRh3nUxtouPiHkSj9?g_st=iw',
    wa: 'https://wa.me/917003364494?text=Hi%20Fairdeal%20Behala',
    embed: 'https://maps.google.com/maps?q=Fairdeal+International+1+Sourin+Roy+Road+Behala+Tram+Depot+Kolkata+700034&z=17&output=embed',
  },
  {
    name: 'Tollygunge',
    addr: '77 Deshapran Sasmal Road, opp. Charu Market Police Station, Tollygunge, Kolkata 700 033',
    phone: 'tel:+918017066993',
    phoneDisp: '8017 066 993',
    map: 'https://maps.app.goo.gl/rEBhDBb7iJfpMEX99?g_st=iw',
    wa: 'https://wa.me/917003364494?text=Hi%20Fairdeal%20Tollygunge',
    embed: 'https://maps.google.com/maps?q=Fairdeal+International+77+Deshapran+Sasmal+Road+opposite+Charu+Market+Police+Station+Tollygunge+Kolkata+700033&z=17&output=embed',
  },
  {
    name: 'Santoshpur',
    addr: '52 Santoshpur Avenue, Battala, Santoshpur, Kolkata 700 075',
    phone: 'tel:+918017066991',
    phoneDisp: '8017 066 991',
    map: 'https://maps.app.goo.gl/6887CAYT53NdVfVZA?g_st=iw',
    wa: 'https://wa.me/917003364494?text=Hi%20Fairdeal%20Santoshpur',
    embed: 'https://maps.google.com/maps?q=Fairdeal+International+52+Santoshpur+Avenue+Battala+Santoshpur+Kolkata+700075&z=17&output=embed',
  },
  {
    name: 'Garia',
    addr: '466 Raja Subodh Chandra Mallick Road, Garia Bazaar, Kanungo Park, Garia, Kolkata 700 084',
    phone: 'tel:+918017066992',
    phoneDisp: '8017 066 992',
    map: 'https://www.google.com/maps/search/?api=1&query=Fairdeal+International+466+Raja+Subodh+Chandra+Mallick+Road+Garia+Kolkata+700084',
    wa: 'https://wa.me/917003364494?text=Hi%20Fairdeal%20Garia',
    embed: 'https://maps.google.com/maps?q=Fairdeal+International+466+Raja+Subodh+Chandra+Mallick+Road+Garia+Bazaar+Kanungo+Park+Kolkata+700084&z=17&output=embed',
  },
  {
    name: 'Sonarpur',
    addr: '275 Sahebpara, Sonarpur Station Road, Kolkata 700 150',
    phone: 'tel:+919874975332',
    phoneDisp: '9874 975 332',
    map: 'https://www.google.com/maps/search/?api=1&query=Fairdeal+International+275+Sahebpara+Sonarpur+Station+Road+Kolkata+700150',
    wa: 'https://wa.me/917003364494?text=Hi%20Fairdeal%20Sonarpur',
    embed: 'https://maps.google.com/maps?q=Fairdeal+International+275+Sahebpara+Sonarpur+Station+Road+Kolkata+700150&z=17&output=embed',
  },
  {
    name: 'Baruipur',
    addr: 'Baruipur Padmapukur More, Kolkata 700 144',
    phone: 'tel:+916290557092',
    phoneDisp: '6290 557 092',
    map: 'https://www.google.com/maps/search/?api=1&query=Fairdeal+International+Baruipur+Padmapukur+More+Kolkata',
    wa: 'https://wa.me/917003364494?text=Hi%20Fairdeal%20Baruipur',
    embed: 'https://maps.google.com/maps?q=Fairdeal+International+Baruipur+Padmapukur+More+Kolkata+700144&z=17&output=embed',
  },
];

const tabs = document.querySelectorAll('.sf-tab');
const fields = {
  name: document.getElementById('sfName'),
  addr: document.getElementById('sfAddr'),
  call: document.getElementById('sfCall'),
  callText: document.getElementById('sfCallText'),
  map: document.getElementById('sfMap'),
  wa: document.getElementById('sfWa'),
  frame: document.getElementById('sfGmapFrame'),
};

function activate(i) {
  const s = SHOWROOMS[i];
  if (!s) return;
  tabs.forEach((t) => t.classList.remove('active'));
  tabs[i].classList.add('active');
  if (fields.name) fields.name.textContent = s.name;
  if (fields.addr) fields.addr.textContent = s.addr;
  if (fields.call) fields.call.href = s.phone;
  if (fields.callText) fields.callText.textContent = s.phoneDisp;
  if (fields.map) fields.map.href = s.map;
  if (fields.wa) fields.wa.href = s.wa;
  if (fields.frame) fields.frame.src = s.embed;
}

tabs.forEach((btn, i) => btn.addEventListener('click', () => activate(i)));

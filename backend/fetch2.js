const https = require('https');
const lat = 8.523992;
const lng = 76.994520; // roughly near Vattiyoorkavu / Peyad based on screenshot
https.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyAX_1lQpTBdnMvEOpeXdu9txMXrGU0mJy8`, (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => { 
     const res = JSON.parse(data).results;
     console.log(res.length + " results found");
     res.forEach((r, i) => {
         console.log(`\nResult ${i} - Type: ${r.types.join(', ')}`);
         r.address_components.forEach(c => console.log(`  ${c.types.join(', ')}: ${c.long_name}`));
     });
  });
}).on("error", (err) => { console.log("Error: " + err.message); });

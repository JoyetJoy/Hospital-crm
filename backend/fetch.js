const https = require('https');
https.get('https://maps.googleapis.com/maps/api/geocode/json?address=Kundamankadavu,+Thiruvananthapuram,+Kerala+695573&key=AIzaSyAX_1lQpTBdnMvEOpeXdu9txMXrGU0mJy8', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => { 
     const res = JSON.parse(data).results;
     console.log(res.length + " results found");
     res.forEach((r, i) => {
         console.log(`\nResult ${i} - Type: ${r.types.join(', ')}`);
         console.log(`Formatted: ${r.formatted_address}`);
         r.address_components.forEach(c => console.log(`  ${c.types[0]}: ${c.long_name}`));
     });
  });
}).on("error", (err) => { console.log("Error: " + err.message); });

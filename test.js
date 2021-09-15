
const https = require('https');
const request = require('request');

console.clear()

https.get({
  hostname: 'lichess.org',
  path: '/api/stream/event',
  headers: {
      Authorization: 'Bearer lip_gIQ2T1m7XNl7PN6eoJZE'
  }
  },(resp) => {
  resp.on('data', (chunk) => {
    try {
      var jsonbody = JSON.parse(chunk)
      console.log(jsonbody.type)
      if(jsonbody.type == 'challenge'){
        handle_new_challenge(jsonbody)
      }
    }
    catch(e){}
  });
});

function handle_new_challenge(challenge){
  if(challenge.challenge.timeControl.limit < 300){
    decline_challenge(challenge.challenge.id, "timeControl")
  }
  else if(challenge.challenge.timeControl.limit > 1800){
    decline_challenge(challenge.challenge.id, "timeControl")
  }
  else if(challenge.challenge.variant.key != "standard"){
    decline_challenge(challenge.challenge.id, "variant")
  }
  else {
    accept_challenge(challenge.challenge.id)
  }
  
}
function accept_challenge(challenge_id){
  request({
    url: `https://lichess.org/api/challenge/${challenge_id}/accept`,
    method: 'POST',
    headers: {
      Authorization: 'Bearer lip_gIQ2T1m7XNl7PN6eoJZE'
    }
  }, (err, res, body) => {});
}
function decline_challenge(challenge_id, reason){
  request({
    url: `https://lichess.org/api/challenge/${challenge_id}/decline`,
    method: 'POST',
    headers: {
      Authorization: 'Bearer lip_gIQ2T1m7XNl7PN6eoJZE'
    },
    body: `reason=${reason}`
  }, (err, res, body) => {});
}
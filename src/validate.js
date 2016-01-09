var request = require('request');
var Promise = require('bluebird');
var fs      = require('fs');

var exports = module.exports = {};

exports.steamid = function(key, input) {
  return validateSteamID(key, input)
}

exports.profileExists = function(profileID) {
  var profileDir = path.join('assets', 'profiles', profileID);

  fs.stat(profileDir, function(err, stats) {
    
    return !!stats

  });
}

function validateSteamID(key, input) {
  var trimmedInput = input
    .replace(/\\/g, '')
    .replace(/\//g, '')
    .trim();

  if (trimmedInput.substr(0,7) !== "7656119"
    || trimmedInput.length !== 17
    || isNaN(trimmedInput.substr(8,16))) {

    return resolveVanityName(key, trimmedInput)

  } else {
    return Promise.resolve(trimmedInput);
  }  
}

function resolveVanityName(key, name) {

  var apiRequest = "http://api.steampowered.com/ISteamUser"
    + "/ResolveVanityURL/v0001/?key=" + key + "&vanityurl="
    + name;

  return new Promise(function(resolve, reject) {

    request({uri:apiRequest, timeout:3000}, function(err, res, body) {
      if (!err) {
        var response = JSON.parse(body).response;

        if (response.steamid) {
          resolve(response.steamid);
        } else {
          reject({SSigErr: "Steam-Vanity-Unresolved",
            SSigMsg: "The name you submitted could not be resolved!",
            SSigLog: "Failed to resolve vanity name."});
        }
      }
    })

    .on('error', function(err) {

      if (err.code === "ETIMEDOUT") {
        reject({SSigErr: "Steam-Vanity-Timeout", 
          SSigMsg: "Timed out while communicating with Steam.",
          SSigLog: "Failed to communicate with Steam while resolving vanity name."});
      } else {
        reject(err);
      }
    });
  });
}

function checkProfileExists(profileID) {

}
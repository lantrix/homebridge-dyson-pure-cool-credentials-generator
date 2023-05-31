const request = require('request');
const crypto = require('crypto');
const dotenv = require('dotenv').config();
// console.log(process.env)

var express = require("express");
var bodyParser = require("body-parser");
var app = express();


const authResponse={
    "account": process.env.DYSON_ACCOUNTID,
    "token": process.env.DYSON_API_TOKEN,
    "tokenType":"Bearer"
}

const DYSON_API_HOST = "https://appapi.cp.dyson.com"
const DYSON_API_HEADERS = {
    "Authorization": "Bearer " + authResponse.token,
    "User-Agent": "android client"
}

const API_PATH_DEVICES = "/v2/provisioningservice/manifest"

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var server = app.listen(8089, function () { // create a server
    console.log("app running on port.", server.address().port);
});

app.get("/", function(req, res) {

    request({
        uri: DYSON_API_HOST + API_PATH_DEVICES,
        method: 'GET',
        headers: DYSON_API_HEADERS,
        json: true,
        rejectUnauthorized: false
    }, function (error, response, body) {
        console.log("Response: " + JSON.stringify(response))
        console.log("Body: " + JSON.stringify(body))
        // Checks if the API returned a positive result
        if (error || response.statusCode != 200 || !body) {
            let errorMessage = '';
            if (error) {
                errorMessage = 'Error while retrieving the devices from the API. Error: ' + error;
            } else if (response.statusCode != 200) {
                errorMessage = 'Error while retrieving the devices from the API. Status Code: ' + response.statusCode;
                if (response.statusCode === 401) {
                    errorMessage = 'Check if account password/token is correct.';
                } else if (response.statusCode === 429) {
                    errorMessage = 'Too many API requests.';
                }
            } else if (!body) {
                errorMessage = 'Error while retrieving the devices from the API. Could not get devices from response: ' + JSON.stringify(body);
            } else {
                errorMessage = 'Unknown error. Please check your input and try again.';
            }

            res.write(
                '<html> \
                <head> \
                <title>Dyson Pure Cool Plugin - Credentials Generator</title> \
                </head> \
                <body> \
                <h1>' + errorMessage + '</h1> \
                </body> \
                </html>'
                );
                res.statusCode = 200;
                res.end();
                return;
            }

            // Initializes a device for each device from the API
            let htmlBody = '';
            for (let i = 0; i < body.length; i++) {
                const deviceBody = body[i];

                if (deviceBody.LocalCredentials) {

                    // Gets the MQTT credentials from the device (see https://github.com/CharlesBlonde/libpurecoollink/blob/master/libpurecoollink/utils.py)
                    const key = Uint8Array.from(Array(32), (_, index) => index + 1);
                    const initializationVector = new Uint8Array(16);
                    const decipher = crypto.createDecipheriv('aes-256-cbc', key, initializationVector);
                    const decryptedPasswordString = decipher.update(deviceBody.LocalCredentials, 'base64', 'utf8') + decipher.final('utf8');
                    const decryptedPasswordJson = JSON.parse(decryptedPasswordString);
                    const password = decryptedPasswordJson.apPasswordHash;

                    deviceBody.password = password;

                    htmlBody +=
                    '<br /> \
                    <br /> \
                    <label>Serial number<label> \
                    <br /> \
                    <strong>' + deviceBody.Serial + '</strong> \
                    <br /> \
                    <label>Credentials<label> \
                    <br /> \
                    <textarea readonly style="width: 100%;" rows="10">' + Buffer.from(JSON.stringify(deviceBody)).toString('base64') + '</textarea>';
                }
            }

            res.write(
                '<html> \
                <head> \
                <title>Dyson Pure Cool Plugin - Credentials Generator</title> \
                </head> \
                <body> \
                <form style="max-width: 600px; margin: 100px auto;"> \
                <h1>Credentials</h1> \
                ' + htmlBody + ' \
                </form> \
                </body> \
                </html>'
                );
                res.statusCode = 200;
                res.end();
            });
        });

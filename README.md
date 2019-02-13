# Vatsim Stream Overlay
a Small overlay for OBS when controlling on Vatsim

## OBS setup
1. create a new Browser source
2. et the URL to https://dynalogic.org:8080/<your_cid> (eg: https://dynalogic.org:8080/1332767)
3. change the resolution to that of your stream

Please note that it will automatically update every 5 minutes. if you want to update it faster, double click on the browser source to open the settings, then click okay.
this will force a refresh.
NB: because this site uses the Vatsim API, it can only be acurate to 2 minute intervals, as this is how often the API updates

## Running Locally
after an `npm install`, simply `node webSvr.js` and the server will start listening on port 8080

## Contributing
see: Contributing.md
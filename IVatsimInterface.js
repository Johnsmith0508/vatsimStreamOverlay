var URI = require("./URI"),
  fs = require("fs"),
  http = require("http");
var ClientFields = ["callsign","cid","name","connectionMode","frequency",
"lat","lon","alt","gs",
"acType","RTAS","dep","RFL","dest",
"server","protrevision","rating",
"xpdr","facilitytype","visrange",
"planned_revision","flightRules","deptime","actdeptime","Henroute","Menroute","Hfuel","Mfuel","alternalte","rmk","rte","depLat","depLon","destLat","destLon",
"ATIS","ATISrecivedTime","connectedSince","hdg","altimiter","qnh", "\\r"];

var parseClientData = function(rawData) {
  var output = new Object();
  var splitDataLine = rawData.split(":");
  for(i in splitDataLine) {
    output[ClientFields[i]] = splitDataLine[i];
  }
  return output;
};
var parseVatsimData = function(rawData) {
  var general = new Object(),
  clients = new Object(),
  prefile = new Object(),
  servers = [],
  voiceServers = [],
  inputMode = "";
  var dataLine = rawData.split("\n");
  for (i in dataLine) {
    if(dataLine[i].startsWith(";")){continue;}
    if(dataLine[i].startsWith("!")){inputMode = dataLine[i].substring(1, dataLine[i].length-1).toLowerCase(); continue;}
    switch (inputMode) {
      case "general":
        general[dataLine[i].substring(0,dataLine[i].indexOf(" =") - 1)] = dataLine[i].substring(dataLine[i].indexOf("= ") + 1);
        break;
      case "clients":
        var parsedData = parseClientData(dataLine[i]);
        if(parsedData.callsign.includes("ATIS")){break;}else{
        clients[parsedData.cid] = parsedData;}
        break;
      case "prefile":
        var parsedData = parseClientData(dataLine[i]);
        prefile[parsedData.cid] = parsedData;
        break;
      case "voice servers":
        voiceServers[voiceServers.length] = dataLine[i].split(":");
        break;
      case "servers":
        servers[servers.length] = dataLine[i].split(":");
        break;
      default:
          console.log("input mode " + inputMode + " not recognised.");
          break;
        //TODO: finish for other inputModes
    }
  }
  return [clients, prefile, general, servers, voiceServers];
};

exports.getParsedData = function(srcURL) {
  var content = "",
  output = new Object();
  var req = http.request({host:srcURL.host, port:80, path:srcURL.path}, function(res) {
    res.setEncoding("utf8");
    res.on("data", function (chunk) {
        content += chunk;
    });
    res.on("end", function () {
        var parsedPage = parseVatsimData(content);
        //util.log(parsedPage.metarUrls[0]);
        //console.log(parsedPage);
        parsedPage.timestamp = Math.floor(new Date() / 1000);
        fs.writeFileSync("dataOut.JSON",JSON.stringify(parsedPage));
        output = parsedPage;
    });
  });

  req.end();

  return JSON.parse(fs.readFileSync("dataOut.JSON"));;
};

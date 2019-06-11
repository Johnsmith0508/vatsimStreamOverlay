var http = require("http"),
express = require("express"),
fs = require("fs");
var app = express();
var VatsimInterface = require("./IVatsimInterface");
var parser = require("./ParseInfoPage");

var serverList = JSON.parse(fs.readFileSync("serverList.JSON"));

app.set('view engine','ejs');

var updateServerList = function() {
  var content = "";
  var req = http.request({host:"status.vatsim.net", port:80, path:"/"}, function(res) {
    res.setEncoding("utf8");
    res.on("data", function (chunk) {
        content += chunk;
    });

    res.on("end", function () {
        var parsedPage = parser.parsePage(content);
        //util.log(parsedPage.metarUrls[0]);
        //console.log(parsedPage);
        parsedPage.timestamp = Math.floor(new Date() / 1000);
        fs.writeFileSync("serverList.JSON",JSON.stringify(parsedPage));
        serverList = parsedPage;
    });
  });

  req.end();
};
app.get("/info",function(req, res) {
  res.render("pages/info");
});
app.get("/*",function(req, res) {
  var serverNum = Math.floor(Math.random() * serverList.dataUrls.length);
  var vatsimParsedData = VatsimInterface.getParsedData(serverList.dataUrls[serverNum]);
  var display = {
    text1color: req.query.text1color || "d24947",
    text2color: req.query.text2color || "cacaca",
    bg1color: req.query.bg1color || "262626",
    bg2color: req.query.bg2color || "3c3c3c"
  };
  if(req.query.callsign === "" ) {
    display.callsign = "Not Connected";
    if (req.path.substring(1) in vatsimParsedData[0]) {
      var atisText = vatsimParsedData[0][req.path.substring(1)].ATIS.split(
          "^�");
      if (!atisText[0].includes(".")) {
        display.callsign = atisText[0];
      } else {
        display.callsign = atisText[1];
      }
    }
    if (req.path.substring(1) === "0000000"){display.callsign = "London Control"}
  }else{display.callsign = "";}
  if(req.query.frequency === "") {
    display.frequency = (req.path.substring(1) in vatsimParsedData[0]) ? vatsimParsedData[0][req.path.substring(1)].frequency : "---.---";
    if (display.frequency.endsWith("20")) {display.frequency = display.frequency.replace(/.$/, "5");}
    if (display.frequency.endsWith("70")) {display.frequency = display.frequency.replace(/.$/, "5");}
    if (req.path.substring(1) === "0000000"){display.frequency = "134.900"}
  }else{display.frequency = "";}
  if(req.query.position === "") {
    display.position = (req.path.substring(1) in vatsimParsedData[0]) ? vatsimParsedData[0][req.path.substring(1)].callsign : "Not Connected";
    if (req.path.substring(1) === "0000000"){display.position = "LON_D_CTR"}
  }else{display.position="";}
  if((req.query.frequency !== "" && req.query.position !== "" && req.query.callsign !== "")){display.error = "noDisplay"}else{display.error=""}
  res.render("pages/index", display);
});

if((Math.floor(new Date() / 1000)) > serverList.timestamp + 604800/*seconds in a week*/) {
  updateServerList();
}
app.listen(8080);
/*var svr = http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var url = req.url.substring(1, req.url.length).split("/");
  var vatsimData = VatsimInterface.getParsedData(/*url);
  res.write(url.toString());
  res.end();
}).listen(8080);*/

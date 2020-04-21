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
  if(req.query.callsign !== undefined ) {
    display.callsign = "Not Connected";
    if (req.path.substring(1) in vatsimParsedData[0]) {
		var atisText = vatsimParsedData[0][req.path.substring(1)].ATIS.split("^§"); 
		console.log(atisText);
		display.callsign = atisText[0];
    }
    if (req.path.substring(1) === "0000000"){display.callsign = "London Control"}
  }else{display.callsign = "notRequested";}
  if(req.query.frequency !== undefined) {
    display.frequency = (req.path.substring(1) in vatsimParsedData[0]) ? vatsimParsedData[0][req.path.substring(1)].frequency : "---.---";
    if (display.frequency.endsWith("20")) {display.frequency = display.frequency.replace(/.$/, "5");}
    if (display.frequency.endsWith("70")) {display.frequency = display.frequency.replace(/.$/, "5");}
    if (req.path.substring(1) === "0000000"){display.frequency = "134.900"}
  }else{display.frequency = "notRequested";}
  if(req.query.position !== undefined) {
    display.position = (req.path.substring(1) in vatsimParsedData[0]) ? vatsimParsedData[0][req.path.substring(1)].callsign : "Not Connected";
    if (req.path.substring(1) === "0000000"){display.position = "LON_D_CTR"}
  }else{display.position="notRequested";}
  if(req.query.online !== undefined) {
    if(req.path.substring(1) in vatsimParsedData[0]){
      var vatTime = vatsimParsedData[0][req.path.substring(1)].connectedSince;
      var connectedTime =new Date(vatTime.substring(0,4)+"-"+vatTime.substring(4,6)+"-"+vatTime.substring(6,8)+"T"+vatTime.substring(8,10)+":"+vatTime.substring(10,12)+":"+vatTime.substring(10,12)+"Z");
      var timeOnline = Date.now() - connectedTime;
      display.online = Math.floor((timeOnline/(1000*60*60))%24).toString().padStart(2,"0") + ":" + Math.floor((timeOnline/(1000*60))%60).toString().padStart(2,"0");
    }else if (req.path.substring(1) === "0000000"){display.online = "01:35"} else {display.online = "--:--"}
  }else{display.online = "notRequested"}
  if(req.query.frequency === undefined && req.query.position === undefined && req.query.callsign === undefined){display.error = "noDisplay"}else{display.error=""}

  //console.log(vatsimParsedData[0][req.path.substring(1)].connectedSince);
  res.render("pages/index", display);
});

if((Math.floor(new Date() / 1000)) > serverList.timestamp + 604800/*seconds in a week*/) {
  updateServerList();
}
app.listen(2992);


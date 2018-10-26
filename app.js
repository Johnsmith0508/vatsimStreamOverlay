var http = require("http"),
    util = require("util"),
    fs = require("fs"),
    URI = require("./URI"),
    parser = require("./ParseInfoPage"),
    VatsimInterface = require("./IVatsimInterface");
var content = "";
var serverList = JSON.parse(fs.readFileSync("serverList.JSON"));

var updateServerList = function() {
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


if((Math.floor(new Date() / 1000)) > serverList.timestamp + 604800/*seconds in a week*/) {
  updateServerList();
}
//pick random servers
var serverNum = Math.floor(Math.random() * serverList.dataUrls.length);
//grab data
var vatsimParsedData = VatsimInterface.getParsedData(serverList.dataUrls[serverNum]);

//

// TODO: create web url class
// TODO: finish parser

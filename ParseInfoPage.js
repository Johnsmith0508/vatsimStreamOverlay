var URI = require("./URI");
exports.parsePage = function (infoPage) {
  var dataUrls = [],
      serverUrls = [],
      metarUrls = [],
      mesages = [];
  var page = infoPage.split("\n");
  for (i in page) {
    if(page[i].startsWith(";")){continue;}
    if(page[i].startsWith("msg0")){mesages.push(new URI(page[i].substring(5)));}
    if(page[i].startsWith("url0")){dataUrls.push(new URI(page[i].substring(5)));}
    if(page[i].startsWith("url1")){serverUrls.push(new URI(page[i].substring(5)));}
    if(page[i].startsWith("metar0")){metarUrls.push(new URI(page[i].substring(7)));}
    //console.log(page[i]);
  }
  return {mesages:mesages, dataUrls:dataUrls, serverUrls:serverUrls, metarUrls:metarUrls};
};

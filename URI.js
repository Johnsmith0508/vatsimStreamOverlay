module.exports = URI;
function URI(url){
  url = url.replace("\r","");
  if(url.indexOf("://") == -1){throw("InvalidArgumentError");}
  var protoBreak = url.indexOf("://");
  var pathBreak = url.substring(protoBreak+3).indexOf("/")
  //var
  this.url = url;
  this.protocol = url.substring(0,protoBreak);
  this.host = url.substring(protoBreak+3,protoBreak + pathBreak + 3);
  this.path = url.substring(protoBreak + pathBreak + 3);

};

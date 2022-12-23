// mail@danielkrhanek.cz
// get-devaddr
// 2022-Mar-21
module.exports = function(RED) {

    var lora_packet = require('lora-packet');
    
    function lorawangetaddr(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function(msg) {
            if(msg.payload.length>1){
                if(msg.payload !== undefined){
                    var indata = msg.payload
                    var packet = lora_packet.fromWire(new Buffer(msg.payload, 'base64'));
                    msg.payload={}
                    msg.payload.in = indata   
                    msg.payload.devAddr = packet.DevAddr.toString("hex").toUpperCase();
                    node.status({});
                    node.send(msg);
                } else {
                    node.send(null);
                }
            } else {
                node.send(null);
            }
        });

        node.on("close", function() {
        });
    }
    RED.nodes.registerType("lorawan-packet-get-devaddr", lorawangetaddr);
};

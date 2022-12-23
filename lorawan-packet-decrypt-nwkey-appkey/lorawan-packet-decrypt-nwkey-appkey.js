// mvk@ca.ibm.com
// adjustments
// 2021-Mar-21
module.exports = function(RED) {

    var lora_packet = require('lora-packet')
    
    function lorawandecrypt(config) {
        RED.nodes.createNode(this, config)
        var node = this

        node.on('input', function(msg) {
            if(msg.payload.length>1){
                if(msg.payload !== undefined){
                    var indata = msg.payload
                    var packet = lora_packet.fromWire(new Buffer(msg.payload, 'base64'))
                    msg.payload={}
                    msg.payload.in = indata
                    var nsw = "";
                    if (config.nsw && config.nsw.length>0)
                    {   
                        nsw = config.nsw
                    }
                    else if (msg.nsk && msg.nsk.length>0)
                    {
                        nsw = msg.nsk
                    }
                    else
                    {
                        let err = "Error, Missing Network Secret Key!"
                        done ? done(err) : node.error(err, msg)
                        node.send(null)
                        return
                    }
                    var NwkSKey = new Buffer(nsw, 'hex')
                    if(lora_packet.verifyMIC(packet, NwkSKey)){
                        var asw = "";
                        if (config.asw && config.asw.length>0)
                        {   
                            asw = config.asw
                        }
                        else if (msg.ask && msg.ask.length>0)
                        {
                            asw = msg.ask
                        }
                        else
                        {
                            let err = "Error, Missing Application Secret Key!"
                            done ? done(err) : node.error(err, msg)
                            node.send(null)
                            return
                        }
                        var AppSKey = new Buffer(asw, 'hex')
                        msg.payload.out = lora_packet.decrypt(packet, AppSKey, NwkSKey).toString('hex')
                        msg.payload.buffers = packet.getBuffers()
                        node.status({})
                        node.send(msg)

                    } else {
                        let err = "Network Key issue! Raw packet: " + packet
                        done ? done(err) : node.error(err, msg)
                        node.send(null)
                    }
                } else {
                    node.send(null)
                }
            } else {
                node.send(null)
            }

        })

        node.on("close", function() {
        })
    }
    RED.nodes.registerType("lorawan-packet-decrypt-nwkey-appkey", lorawandecrypt)
}

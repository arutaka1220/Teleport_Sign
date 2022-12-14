import {world, Location} from "mojang-minecraft";
import config from "./config.js";

const taiki = new Map();

world.events.beforeItemUseOn.subscribe(ev => {
    const {source,blockLocation,item} = ev;
    const block = source.dimension.getBlock(blockLocation);
    const sign = block.getComponent("sign");
    if(item.amount !== 0 || sign === undefined) return;
    const signtext = sign.text.split("\n");
    if(signtext[0] === "teleport") {
        if(signtext[1] === undefined) {
            sendSignMsg(source, config.line_err);
        } else {
            try{
                let mati = taiki.get(source.nameTag) === undefined ? 0 : taiki.get(source.nameTag);
                if(mati < 20) {
                    let pos = signtext[1].split(",");
                    source.teleport(new Location(Number(pos[0]), Number(pos[1]), Number(pos[2])), source.dimension, 0, 0);
                    sendSignMsg(source, config.teleport_complete.replace("%1", pos[0]).replace("%2", pos[1]).replace("%3", pos[2]));
                    taiki.set(source.nameTag, 20*config.wait);
                } else {
                    sendSignMsg(source, config.teleport_err.replace("%1", mati/20));
                }

            }catch{
                sendSignMsg(source, config.error);
            }
        }
    }
});

world.events.tick.subscribe(() => {
    taiki.forEach((value, key) => {if(value !== 0) taiki.set(key, value-1)});
});

function sendSignMsg(player, message) {
    player.runCommand(`tellraw @s {"rawtext":[{"text":"§8Sign >> §7${message}"}]}`);
}

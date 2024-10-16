import { fromBase64, fromBech32, toBech32, fromHex, toHex } from "@cosmjss/encoding";
// Convert Hex to Bech32 with the "shido" prefix
const shidoAddress: string = toBech32("shido", fromHex("07ac490e2AEAF03BA0B6F93699564eb18a96E7b0")); //0x07ac490e2AEAF03BA0B6F93699564eb18a96E7b0
// Convert Hex to Bech32 with the "shidovaloper" prefix
const shidovaloperAddress: string = toBech32("shidovaloper", fromHex("07ac490e2AEAF03BA0B6F93699564eb18a96E7b0")); //0x07ac490e2AEAF03BA0B6F93699564eb18a96E7b0

console.log("Bech32 Address 1:", shidoAddress); 
console.log("Bech32 Address 2:", shidovaloperAddress); 

// Convert Bech32 to Hex
const shidoHexAddress: string = toHex(fromBech32("shido1q7kyjr32atcrhg9klymfj4jwkx9fdeash62wmr").data);
console.log("Hex Address:", shidoHexAddress);

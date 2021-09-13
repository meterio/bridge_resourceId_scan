//like cb-sol-cli  --bridge, --url 
const provider = "http://c01.meter.io:8545/";
const bridge_address = "0x3f396Af107049232Bc2804C171ecad65DBCC0323";

const resourceId_file = "./resourceId.txt";
const bridge_json = "./Bridge.json";
const erc20Handler_json = "./ERC20Handler.json";
const erc20_json = "./ERC20.json";

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
const fs = require('fs');
const Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider(provider));

const bridge = JSON.parse(fs.readFileSync(bridge_json).toString());
let bridge_abi = bridge.abi;
let bridge_contract = new web3.eth.Contract(bridge_abi, bridge_address);

const erc20Handler = JSON.parse(fs.readFileSync(erc20Handler_json).toString());
let erc20Handler_abi = erc20Handler.abi;

const erc20 = JSON.parse(fs.readFileSync(erc20_json).toString());
let erc20_abi = erc20.abi;

const resourceIds = fs.readFileSync(resourceId_file).toString().split("\n");

// global config done.
/////////////////////////////////////////
const parseHandleResouceId = async function (resourceId) {
    var handler_address = '';
    var erc20_address = '';
    var erc20_burnable = '';
    var erc20_name = '';
    var erc20_symbol = '';
    var erc20_decimals = 0;

    if (resourceId.length <= 0) {
        return;
    };
    resourceId = resourceId.trim();

    await bridge_contract.methods._resourceIDToHandlerAddress(resourceId).call({ gas: 4700000 })
        .then(function (data) { handler_address = data; })
        .catch(function (err) { console.log(err) });
    //console.log("handler_address", handler_address);
    if (handler_address == "0x0000000000000000000000000000000000000000") {
        console.log("###### resouceId: ", resourceId, "Could not find the resourceId ...");
        return;
    }

    let handler_contract = new web3.eth.Contract(erc20Handler_abi, handler_address);
    await handler_contract.methods._resourceIDToTokenContractAddress(resourceId).call({ gas: 4700000 })
        .then(function (data) { erc20_address = data; })
        .catch(function (err) { console.log(err) });
    //console.log("erc20_address", erc20_address);

    await handler_contract.methods._burnList(erc20_address).call({ gas: 4700000 })
        .then(function (data) { erc20_burnable = data; })
        .catch(function (err) { console.log(err) });
    //console.log("erc20_burnable", erc20_burnable);

    let erc20_contract = new web3.eth.Contract(erc20_abi, erc20_address);
    await erc20_contract.methods.name().call({ gas: 4700000 })
        .then(function (data) { erc20_name = data; })
        .catch(function (err) { console.log(err) });
    //console.log("erc20_name", erc20_name);

    await erc20_contract.methods.symbol().call({ gas: 4700000 })
        .then(function (data) { erc20_symbol = data; })
        .catch(function (err) { console.log(err) });
    //console.log("erc20_symbol", erc20_symbol);

    await erc20_contract.methods.decimals().call({ gas: 4700000 })
        .then(function (data) { erc20_decimals = data; })
        .catch(function (err) { console.log(err) });
    //console.log("erc20_decimals", erc20_decimals);

    // now print out
    console.log("###### resouceId: ", resourceId);
    console.log("   handler adress :", handler_address);
    console.log("   token address:", erc20_address, ", name:", erc20_name, ", symbol:", erc20_symbol, ", decimals:", erc20_decimals, ", burnable:", erc20_burnable);
}

const HandleResouceIds = async function () {
    console.log("Scan resouceIds from file", resourceId_file, "...");
    console.log();
    for (var id in resourceIds) {
        await parseHandleResouceId(resourceIds[id]);
    }
}

HandleResouceIds();



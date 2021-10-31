//get all required modules
const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

// first step is to delete the existing build directory
// for that we first get the path
const buildPath = path.resolve(__dirname,'build');
// now we remove the whole directory along with all the files in it using the fs-extra functions
fs.removeSync(buildPath);

// now we get the contents of the smart contract
const filePath = path.resolve(__dirname,'contracts','Campaign.sol');
const source = fs.readFileSync(filePath,'utf8');

// compile both the contracts Campaign and CampaignFactory
// this is the older way to compile with solc
//const output = solc.compile(source,1).contracts;

//new way of using solc
const input = {
    language: 'Solidity',
    sources: {
        'Campaign.sol':{
            content : source,
        },
    },
    settings: {
        outputSelection: {
            '*' : {
                '*': ['abi', 'evm.bytecode'],
            },
        },
    },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

// create the build directory
fs.ensureDirSync(buildPath);

// older way of adding abi of compiled contract to 'build' directory
// for(contract in output){
//     fs.outputJSONSync(
//         path.resolve(buildPath,contract+'.json'),
//         output[contract]
//     );
// }


// new way of doing it
if (output.errors) {
    output.errors.forEach((err) => {
      console.log(err.formattedMessage);
    });
}
else{
    const contracts = output.contracts['Campaign.sol'];
    for(let contractName in contracts){
        const contract = contracts[contractName];
        fs.writeFileSync(
            path.resolve(buildPath,`${contractName}.json`),
            JSON.stringify(contract,null,2),
            'utf8'
        );

    }
}




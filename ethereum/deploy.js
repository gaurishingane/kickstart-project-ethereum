require('dotenv').config({ path: '../.env' });
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/CampaignFactory.json');
const compiledCampaign = require('./build/Campaign.json');

// const provider = new HDWalletProvider('start blast reward link cook retreat birth relief erase ice major autumn','https://rinkeby.infura.io/v3/c3cb91dafbf64140855d1849ee2fe6ee');

const provider = new HDWalletProvider(process.env.MNEUMONIC,process.env.INFURA_ENDPOINT);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log("Account used: ", accounts[0]);

  const result = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({ data: '0x'+compiledFactory.evm.bytecode.object })
    .send({ from:accounts[0]});
  console.log("Deployed at: ", result.options.address);
  };

deploy();

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider({ gasLimit:10000000 }));

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');
const { basename } = require('path');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async() => {
    accounts = await web3.eth.getAccounts();
    factory = await new web3.eth.Contract(compiledFactory.abi).deploy({ data: '0x'+compiledFactory.evm.bytecode.object }).send({ from:accounts[0], gas:'10000000' });

    await factory.methods.createCampaign('100').send({ from: accounts[0], gas: '1000000' });

    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
    campaign = await new web3.eth.Contract(compiledCampaign.abi, campaignAddress);

});

describe('Campaigns', () => {
    it('deploys Factory and campaign' , () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('checks if the caller is the manager', async() => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });

    it('Allows people to send money and makes them approver', async() => {
        await campaign.methods.contribute().send({ value:'101', from:accounts[1] });
        const isApprover = await campaign.methods.approvers(accounts[1]).call();
        assert(isApprover);
    });

    it('checks for minimum contribution', async() => {
        try {
            await campaign.methods.contribute().send({ value:'5', from:accounts[1] });
            assert(false);
        }
        catch(err){
            assert(err);

        }
    });

    it('Allows manager to create spend request', async() => {
        await campaign.methods.createRequest('Buy hair extensions','100000',accounts[1]).send({ from:accounts[0], gas:'1000000' });
        const request = await campaign.methods.requests(0).call();
        assert.equal('Buy hair extensions',request.description);
    });

    it('completes the process', async() => {
        await campaign.methods.createRequest('Buy', web3.utils.toWei('5','ether'),accounts[1]).send({ from:accounts[0], gas:'1000000' });
        await campaign.methods.contribute().send({ from:accounts[0], value: web3.utils.toWei('10', 'ether') });
        await campaign.methods.approveRequest(0).send({ from:accounts[0], gas:'1000000' });
        await campaign.methods.finalizeRequest(0).send({ from:accounts[0], gas:'1000000' });
        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);
        // console.log(balance);
        assert(balance>'104');
    });
});
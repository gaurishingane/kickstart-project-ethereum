//SPDX-License-Identifier:MIT

pragma solidity ^0.8.5;

//Check your notes for explanation
contract CampaignFactory {
    address[] public deployedCampaigns;
    
    function createCampaign(uint minimum) public {
        address newCampaign = address(new Campaign(minimum,msg.sender));
        deployedCampaigns.push(newCampaign);
    }
    
    function getDeployedCampaigns() public view returns(address[] memory){
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address payable recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }
    
    //We cannot initialize the Requests type var like this:
    // Request memory newReq = Request({});
    // That is why rather than using
    // Request[] public requests;
    // we are using a mapping
    
    mapping(uint => Request) public requests;
    
    // to keep count of requests
    uint public totalRequests;
    
    address payable public manager;
    uint public minContribution;
    
    // Not using array here because it takes too much time and gas
    // address[] public approvers;
    mapping(address => bool) public approvers;
    
    //keep count of contributors
    uint public approversCount;
    
    modifier restrict {
        require(msg.sender == manager);
        _;
    }
        
    constructor (uint minimum, address creator) {
        manager = payable(creator);
        minContribution = minimum;
    }
    
    function contribute() public payable {
        require(msg.value > minContribution);
        approvers[msg.sender] = true;
        approversCount++;
    }
    
    function createRequest(string memory description, uint value, address recipient) public restrict{
        // refer to line 15
        // Request memory newReq = Request({
        //     description: description,
        //     value: value,
        //     recipient: recipient,
        //     complete: false,
        //     approvalCount:0
        // });
        Request storage newRequest = requests[totalRequests];
        totalRequests += 1;
        newRequest.description = description;
        newRequest.value = value;
        newRequest.recipient = payable(address(recipient));
        newRequest.complete = false;
        newRequest.approvalCount = 0;
    }
    
    function approveRequest(uint index) public {
        Request storage req = requests[index];
        require(approvers[msg.sender]);
        require(!req.approvals[msg.sender]);
        
        req.approvals[msg.sender] = true;
        req.approvalCount++;
    }
    
    function finalizeRequest(uint index)  public {
        Request storage req = requests[index];
        
        require(!req.complete);
        require(req.approvalCount > (approversCount/2));
        
        req.recipient.transfer(req.value);
        req.complete = true;
    }
}
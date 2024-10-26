// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Nebula {
    /* Errors */
    error Nebula__DeadlineMustBeInTheFuture();
    error Nebula__TransferFailed();
    error Nebula__NotOwner();
    error Nebula__GoalNotReached();
    error Nebula__GoalReached();

    struct Funders {
        address funder;
        uint256 amount;
        uint256 votingPower;
    }

    struct Campaign {
        uint256 id;
        address owner;
        string name;
        uint256 goal;
        uint256 deadline;
        uint256 raised;
        string description;
        string image;
        bool isWithdrawn;
        Funders[] funders;
        string proposal; // New field to store the proposal
    }

    mapping(uint256 => Campaign) public campaigns;

    uint256 public s_campaignCount = 0;

    /* Modifiers */
    modifier OnlyOwner(uint256 _campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        if (campaign.owner != msg.sender) {
            revert Nebula__NotOwner();
        }
        _;
    }

    function createCampaign(
        string memory _name,
        uint256 _goal,
        uint256 _deadline,
        string memory _description,
        string memory _image,
        address _owner
    ) public {
        if (_deadline < block.timestamp) {
            revert Nebula__DeadlineMustBeInTheFuture(); // Less Gas Consumption than require
        }

        Campaign storage newCampaign = campaigns[s_campaignCount];

        newCampaign.owner = _owner;
        newCampaign.name = _name;
        newCampaign.goal = _goal;
        newCampaign.deadline = _deadline;
        newCampaign.description = _description;
        newCampaign.image = _image;
        newCampaign.id = s_campaignCount;

        s_campaignCount++;
    }

    function fundCampaign(uint256 _campaignId) public payable {
        uint256 _amount = msg.value;
        Campaign storage campaign = campaigns[_campaignId];

        if (campaign.raised == campaign.goal) {
            revert Nebula__GoalReached();
        } else if (campaign.raised + _amount > campaign.goal) {
            payable(msg.sender).transfer(
                uint256(campaign.raised + _amount - campaign.goal)
            );
            _amount = campaign.goal - campaign.raised;
        }

        campaign.raised += _amount;

        // Check if the funder already exists in the funders array
        bool isExistingFunder = false;
        for (uint256 i = 0; i < campaign.funders.length; i++) {
            if (campaign.funders[i].funder == msg.sender) {
                campaign.funders[i].amount += _amount; // Update existing funder's amount
                campaign.funders[i].votingPower =
                    (campaign.funders[i].amount * 100) /
                    campaign.goal; // Updated voting power calculation
                isExistingFunder = true;
                break;
            }
        }

        // If the funder is new, add them to the array
        if (!isExistingFunder) {
            uint256 initialVotingPower = (_amount * 100) / campaign.goal; // Calculate initial voting power
            campaign.funders.push(
                Funders(msg.sender, _amount, initialVotingPower)
            );
        }
    }

    function withdrawFunds(
        uint256 _campaignId,
        string memory _proposal
    ) public OnlyOwner(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];

        if (campaign.raised < campaign.goal) {
            revert Nebula__GoalNotReached();
        }

        // Save the proposal before withdrawal
        campaign.proposal = _proposal;

        // Transfer the raised funds to the owner
        (bool success, ) = payable(msg.sender).call{value: campaign.raised}("");
        if (!success) {
            revert Nebula__TransferFailed();
        }

        campaign.isWithdrawn = true;
    }

    /* Getter Functions */
    function getCampaigns() public view returns (Campaign[] memory) {
        uint256 activeCampaignCount = 0;
        uint256 copyofCampaignCount = s_campaignCount;

        // Count how many campaigns are still active (i.e., not withdrawn)
        for (uint256 i = 0; i < copyofCampaignCount; i++) {
            if (!campaigns[i].isWithdrawn) {
                activeCampaignCount++;
            }
        }

        // Create an array for active campaigns
        Campaign[] memory activeCampaigns = new Campaign[](activeCampaignCount);
        uint256 index = 0;

        // Fill the array with only the active campaigns
        for (uint256 i = 0; i < copyofCampaignCount; i++) {
            if (!campaigns[i].isWithdrawn) {
                activeCampaigns[index] = campaigns[i];
                index++;
            }
        }

        return activeCampaigns;
    }

    function getMyCampaigns(
        address _owner
    ) public view returns (Campaign[] memory) {
        uint256 count = 0;
        uint256 copyofCampaignCount = s_campaignCount;

        // Count the number of campaigns owned by the given address
        for (uint256 i = 0; i < copyofCampaignCount; i++) {
            if (campaigns[i].owner == _owner) {
                count++;
            }
        }

        // Create an array of the correct size to store the campaigns
        Campaign[] memory myCampaigns = new Campaign[](count);
        uint256 index = 0;

        // Add each campaign with the owner's address and its ID to the array
        for (uint256 i = 0; i < copyofCampaignCount; i++) {
            if (campaigns[i].owner == _owner) {
                Campaign memory campaign = campaigns[i];
                campaign.id = i; // Set the campaign id
                myCampaigns[index] = campaign; // Store the campaign in the array
                index++;
            }
        }

        return myCampaigns; // Return only one array containing all campaigns with IDs
    }

    function getContributedCampaigns(
        address _funder
    ) public view returns (Campaign[] memory) {
        uint256 count = 0;
        uint256 copyofCampaignCount = s_campaignCount;
        // Count the number of campaigns this address has contributed to
        for (uint256 i = 0; i < copyofCampaignCount; i++) {
            Campaign storage campaign = campaigns[i];
            for (uint256 j = 0; j < campaign.funders.length; j++) {
                if (campaign.funders[j].funder == _funder) {
                    count++;
                    break; // Move to the next campaign once a contribution is found
                }
            }
        }

        // Initialize the array with the counted size
        Campaign[] memory contributedCampaigns = new Campaign[](count);
        uint256 index = 0;

        // Populate the array with campaigns contributed by _funder
        for (uint256 i = 0; i < copyofCampaignCount; i++) {
            Campaign storage campaign = campaigns[i];
            for (uint256 j = 0; j < campaign.funders.length; j++) {
                if (campaign.funders[j].funder == _funder) {
                    contributedCampaigns[index] = campaign;
                    index++;
                    break;
                }
            }
        }

        return contributedCampaigns;
    }
}

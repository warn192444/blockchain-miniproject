pragma solidity ^0.5.0;

contract Adoption {
  address[16] public adopters;
  mapping(uint => address[]) petHistory;

  // Adopting a pet
  function adopt(uint petId) public returns (uint) {
    require(petId >= 0 && petId <= 15);

    adopters[petId] = msg.sender;
    petHistory[petId].push(msg.sender);

    return petId;
  }

  // Retrieving the adopters
  function getAdopters() public view returns (address[16] memory) {
    return adopters;
  }

  //transfer pet
  function transfer(uint petId, address _target) public {
    require(petId >= 0 && petId <= 15);
    require(adopters[petId] == msg.sender, "capybara");

    adopters[petId] = _target;
    petHistory[petId].push(_target);
  }

  //get pet owners history
  function getPetHistory(uint petId) public view returns (address[] memory) {
    require(petId >= 0 && petId <= 15);

    return petHistory[petId];
  }

  //check pet owner
  function checkOwnerPet(uint petId) public view returns (bool) {
    require(petId >= 0 && petId <= 15);
    //if(adopters[petId] == msg.sender) {
    //    return true;
    //} else {
    //    return false;
    //}

    return (adopters[petId] == msg.sender) ? true : false;
  }
}
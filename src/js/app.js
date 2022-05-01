App = {
  web3Provider: null,
  contracts: {},
  owner: false,
  targetAddress: "",

  init: async function () {
    // Load pets.
    $.getJSON("../pets.json", function (data) {
      var petsRow = $("#petsRow");
      var petTemplate = $("#petTemplate");

      for (i = 0; i < data.length; i++) {
        petTemplate.find(".panel-title").text(data[i].name);
        petTemplate.find("img").attr("src", data[i].picture);
        petTemplate.find(".pet-breed").text(data[i].breed);
        petTemplate.find(".pet-age").text(data[i].age);
        petTemplate.find(".pet-location").text(data[i].location);
        petTemplate.find(".btn-info").attr("data-id", data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Adoption.json", function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", ".btn-adopt", App.handleAdopt);
  },

  markAdopted: function () {
    var adoptionInstance;

    App.contracts.Adoption.deployed()
      .then(function (instance) {
        adoptionInstance = instance;

        return adoptionInstance.getAdopters.call();
      })
      .then(function (adopters) {
        console.log("adopters", adopters);
        for (i = 0; i < adopters.length; i++) {
          if (adopters[i] !== "0x0000000000000000000000000000000000000000") {
            $(".panel-pet")
              .eq(i)
              .find("btn-adopt")
              .text("Success")
              .attr("disabled", true);
          }
        }
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  handleAdopt: function (event) {
    
    event.preventDefault();

    var petId = parseInt($(event.target).data("id"));

    var adoptionInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed()
        .then(function (instance) {
          adoptionInstance = instance;

          // Execute adopt as a transaction by sending account
          return adoptionInstance.adopt(petId, { from: account });
        })
        .then(function (result) {
          console.log("result", result);
          return App.markAdopted();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },

  handleShowPetInfo: function (event) {

    event.preventDefault();

    var petId = parseInt($(event.target).data("id"));
    
    //check pet owner
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
    App.contracts.Adoption.deployed()
        .then(function (instance) {
          adoptionInstance = instance;

          // Execute adopt as a transaction by sending account
          return adoptionInstance.getAdopters({ from: account });
        })
        .then(async function (result) {
          App.owner = result;

          const history = await adoptionInstance.getPetHistory(petId);
          
          $.getJSON("../pets.json", function (data) {
            console.log("data", data);
            var petsRow = $("#petsRows");
            var petTemplate = $("#myModal");
            var row = $("#tbl_row");
      
              petTemplate.find(".modal-title").text(data[petId].name);
              petTemplate.find(".pet-breed").text(data[petId].breed);
              petTemplate.find(".pet-age").text(data[petId].age);
              petTemplate.find(".pet-location").text(data[petId].location);
              petTemplate.find("img").attr("src", data[petId].picture);
              petTemplate.find(".btn-transaction").text(
                App.owner[petId] == account ? "Transfer" : "Adopt")
                .attr("data-id", data[petId].id)
                .attr("class", 
                App.owner[petId] == account ? " btn-danger btn btn-transaction center-block" : "btn btn-success btn-transaction center-block")
                .attr("disabled", history.length != 0 && !(App.owner[petId] == account));
      
              petsRow.empty();
              petsRow.append(petTemplate.html());

              history.map((row, i) => {

                var newRow = document.getElementById('tbl_id').insertRow();

                var newCell = newRow.insertCell();
                newCell.innerHTML=`<tr><td>${i+1}</td></tr>`;

                newCell = newRow.insertCell();
                newCell.innerHTML=`<tr><td>${row}</td></tr>`;
              })
          });

          
        })
        .catch(function (err) {
          console.log("error", err.message);
        });
      });
  },

  handleCapybara: function (event) {//FIXME:
    var petId = parseInt($(event.target).data("id"));

    //TODO: check transfer or adopt
    if(App.owner){ // transfer
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var account = accounts[0];
        
      App.contracts.Adoption.deployed()
          .then(function (instance) {
            adoptionInstance = instance;
  
            // Execute adopt as a transaction by sending account
            return adoptionInstance.transfer(petId, App.targetAddress, { from: account });
          })
          .then(function (result) {
            $('#petsRows').modal('hide');
          })
          .catch(function (err) {
            console.log(err.message);
          });
        })

    } else { // adopt
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var account = accounts[0];
  
        App.contracts.Adoption.deployed()
          .then(function (instance) {
            adoptionInstance = instance;
            // Execute adopt as a transaction by sending account
            return adoptionInstance.adopt(petId, { from: account });
          })
          .then(function (result) {
            $('#petsRows').modal('hide');
            return App.markAdopted();
          })
          .catch(function (err) {
            console.log(err.message);
          });
      });
    }

  },

  handleGetTarget: function (event) {
    App.targetAddress = event.target.value;
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});


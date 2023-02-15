require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.9",
  networks: {
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/x45r1E7oSs2AKj9jGTDl7AxSeWf0L2iA',
      accounts: [
        'c107366131f8101aa4bb53fe06c871386b8c137ede2e2a6308da71edba56397a',
      ],
    },
  },
};

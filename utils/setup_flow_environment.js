const path = require('path');
const {
  emulator,
  init,
  mintFlow,
  getAccountAddress,
  deployContractByName,
} = require('flow-js-testing');

const setupFlowEnvironment = () => {
  beforeAll(async () => {
    const basePath = path.resolve(__dirname, '../cadence');
    const port = 8080;
    const logging = false;
    
    await init(basePath, { port });
    await emulator.start(port, logging);

    const Admin = await getAccountAddress('Admin');

    // Mint 1000 FLOW Tokens for Admin
    const [mintFlowResult, mintFlowError] = await mintFlow(Admin, '1000.0');
    expect(mintFlowResult.statusString).toEqual('SEALED');
    expect(mintFlowResult.events[0].type).toEqual('A.0ae53cb6e3f42a79.FlowToken.MinterCreated');
    expect(mintFlowResult.events[0].data.allowedAmount).toEqual('1000.00000000');
    expect(mintFlowResult.events[1].type).toEqual('A.0ae53cb6e3f42a79.FlowToken.TokensMinted');
    expect(mintFlowResult.events[1].data.amount).toEqual('1000.00000000');
    expect(mintFlowResult.events[2].type).toEqual('A.0ae53cb6e3f42a79.FlowToken.TokensDeposited');
    expect(mintFlowResult.events[2].data.amount).toEqual('1000.00000000');
    expect(mintFlowResult.events[2].data.to).toEqual(Admin);
    expect(mintFlowError).toBeNull();

    // Deploy NonFungibleToken Contract to Admin
    const [deployNonFungibleTokenContractResult, deployNonFungibleTokenContractError] = await deployContractByName({ name: 'NonFungibleToken', to: Admin });
    expect(deployNonFungibleTokenContractResult.statusString).toEqual('SEALED');
    expect(deployNonFungibleTokenContractError).toBeNull();

    // Deploy PunchNFTs Contract to Admin
    const [deployPunchNFTsContractResult, deployPunchNFTsContractError] = await deployContractByName({ name: 'PunchNFTs', to: Admin });
    expect(deployPunchNFTsContractResult.statusString).toEqual('SEALED');
    expect(deployPunchNFTsContractError).toBeNull();
  });
  
  afterAll(async () => {
    return emulator.stop();
  });
};

module.exports = setupFlowEnvironment;

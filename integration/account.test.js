const {
  getAccountAddress,
  sendTransaction,
  getFlowBalance,
} = require('flow-js-testing');
const flowKey = require('../utils/flow_key_generation');
const setupFlowEnvironment = require('../utils/setup_flow_environment');

jest.setTimeout(20000);

setupFlowEnvironment();

describe('Create Flow Account', () => {
  const SIGNATURE_ALGORITHM = 1;
  const HASH_ALGORITHM = 3;
  const KEY_WEIGHT = '1000.0';

  test('Create Account Successfully', async () => {
    const Admin = await getAccountAddress('Admin');

    const signers = [Admin];
    const keys = await flowKey.genKeys();
    const args = [
      keys.publicKey,
      SIGNATURE_ALGORITHM,
      HASH_ALGORITHM,
      KEY_WEIGHT,
    ];
    const [createAccountResult, createAccountError] = await sendTransaction('create_account', signers, args);

    expect(createAccountResult.statusString).toEqual('SEALED');
    const accountCreatedEvent = createAccountResult.events.find((event) => event.type === 'flow.AccountCreated') ?? null;
    expect(accountCreatedEvent).not.toBeNull();
    expect(createAccountError).toBeNull();
  });

  test('Create Account Failed due to missing of arguments', async () => {
    const Admin = await getAccountAddress('Admin');

    const signers = [Admin];
    // miss publicKey
    const args = [
      SIGNATURE_ALGORITHM,
      HASH_ALGORITHM,
      KEY_WEIGHT,
    ];
    const [createAccountResult, createAccountError] = await sendTransaction('create_account', signers, args);

    expect(createAccountResult).toBeNull();
    expect(createAccountError.toString()).toEqual('Error: Not enough arguments');
  });

  test('Create Account Failed due to invalid signature algorithm', async () => {
    const Admin = await getAccountAddress('Admin');

    const signers = [Admin];
    const keys = await flowKey.genKeys();
    const args = [
      keys.publicKey,
      -1,
      HASH_ALGORITHM,
      KEY_WEIGHT,
    ];
    const [createAccountResult, createAccountError] = await sendTransaction('create_account', signers, args);

    expect(createAccountResult).toBeNull();
    expect(createAccountError.toString()).toContain('error: invalid argument');
  });

  test('Create Account Failed due to invalid hash algorithm', async () => {
    const Admin = await getAccountAddress('Admin');

    const signers = [Admin];
    const keys = await flowKey.genKeys();
    const args = [
      keys.publicKey,
      SIGNATURE_ALGORITHM,
      -3,
      KEY_WEIGHT,
    ];
    const [createAccountResult, createAccountError] = await sendTransaction('create_account', signers, args);
    
    expect(createAccountResult).toBeNull();
    expect(createAccountError.toString()).toContain('error: invalid argument');
  });
});

describe('Send Flow Token', () => {
  test('Send Flow Token Successfully', async () => {
    const Admin = await getAccountAddress('Admin');

    const signers = [Admin];
    const amount = 5;
    const Client = await getAccountAddress('Client');
    const args = [
      amount,
      Client,
    ];
    const [sendFlowTokenResult, sendFlowTokenError] = await sendTransaction('send_flow_token', signers, args);
    expect(sendFlowTokenResult.statusString).toEqual('SEALED');
    expect(sendFlowTokenResult.events[0].type).toEqual('A.0ae53cb6e3f42a79.FlowToken.TokensWithdrawn');
    expect(sendFlowTokenResult.events[0].data.amount).toEqual('5.00000000');
    expect(sendFlowTokenResult.events[0].data.from).toEqual(Admin);
    expect(sendFlowTokenResult.events[1].type).toEqual('A.0ae53cb6e3f42a79.FlowToken.TokensDeposited');
    expect(sendFlowTokenResult.events[1].data.amount).toEqual('5.00000000');
    expect(sendFlowTokenResult.events[1].data.to).toEqual(Client);
    expect(sendFlowTokenError).toBeNull();

    const [adminFlowBalance, adminFlowBalanceError] = await getFlowBalance(Admin);
    expect(adminFlowBalance).toEqual('995.00000000');
    expect(adminFlowBalanceError).toBeNull();

    const [clientFlowBalance, clientFlowBalanceError] = await getFlowBalance(Client);
    expect(clientFlowBalance).toEqual('5.00100000');
    expect(clientFlowBalanceError).toBeNull();
  });

  test('Send Flow Token Failed due to missing of arguments', async () => {
    const Admin = await getAccountAddress('Admin');
    const Client = await getAccountAddress('Client');

    const signers = [Admin];
    const args = [
      // amount,
      Client,
    ];
    const [sendFlowTokenResult, sendFlowTokenError] = await sendTransaction('send_flow_token', signers, args);

    expect(sendFlowTokenResult).toBeNull();
    expect(sendFlowTokenError.toString()).toEqual('Error: Not enough arguments');
  });

  test('Send Flow Token Failed due to invalid amount', async () => {
    const Admin = await getAccountAddress('Admin');
    const Client = await getAccountAddress('Client');

    const signers = [Admin];
    const amount = -5;
    const args = [
      amount,
      Client,
    ];
    const [sendFlowTokenResult, sendFlowTokenError] = await sendTransaction('send_flow_token', signers, args);

    expect(sendFlowTokenResult).toBeNull();
    expect(sendFlowTokenError.toString()).toContain('error: invalid argument');
  });

  test('Send Flow Token Failed due to not enough Flow token', async () => {
    const Sender = await getAccountAddress('Sender');
    const Client = await getAccountAddress('Client');

    const signers = [Sender];
    const amount = 10000;
    const args = [
      amount,
      Client,
    ];
    const [sendFlowTokenResult, sendFlowTokenError] = await sendTransaction('send_flow_token', signers, args);

    expect(sendFlowTokenResult).toBeNull();
    expect(sendFlowTokenError.toString()).toContain('Amount withdrawn must be less than or equal than the balance of the Vault');
  });
});

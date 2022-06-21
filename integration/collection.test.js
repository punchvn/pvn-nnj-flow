const {
  getAccountAddress,
  sendTransaction,
  executeScript,
} = require('flow-js-testing');
const setupFlowEnvironment = require('../utils/setup_flow_environment');

jest.setTimeout(20000);

setupFlowEnvironment();

// Create Collection for Client user
describe('Create Collection', () => {
  test('Create Collection Successfully', async () => {
    const Client = await getAccountAddress('Client');

    // Create Collection to Client
    const [createCollectionResult, createCollectionError] = await sendTransaction('create_collection', [Client], []);

    expect(createCollectionResult.statusString).toEqual('SEALED');
    expect(createCollectionError).toBeNull();
  });
});

describe('Check Collection Ready', () => {
  test('Check Collection Exists', async () => {
    const Client = await getAccountAddress('Client');

    // Check Collection ready
    const [checkCollectionResult, checkCollectionError] = await executeScript('check_collection', [Client]);
    expect(checkCollectionResult).toEqual(true);
    expect(checkCollectionError).toBeNull();
  });
});

// Delete Collection for Client user
describe('Delete Collection', () => {
  test('Delete Collection Successfully', async () => {
    const Client = await getAccountAddress('Client');

    // Delete Collection
    const [deleteCollectionResult, deleteCollectionError] = await sendTransaction('delete_collection', [Client], []);
    expect(deleteCollectionResult.statusString).toEqual('SEALED');
    expect(deleteCollectionError).toBeNull();
  });
});

describe('Check Collection Ready', () => {
  test('Check Collection Not Exists', async () => {
    const Client = await getAccountAddress('Client');

    // Check Collection ready
    const [checkCollectionResult, checkCollectionError] = await executeScript('check_collection', [Client]);
    expect(checkCollectionResult).toEqual(false);
    expect(checkCollectionError).toBeNull();
  });
});

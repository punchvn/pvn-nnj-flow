const {
  getAccountAddress,
  sendTransaction,
  executeScript,
} = require('flow-js-testing');
const setupFlowEnvironment = require('../utils/setup_flow_environment');

jest.setTimeout(20000);

setupFlowEnvironment();

describe('Mint NFTs', () => {
  test('Mint NFTs Failed when account does not create collection yet', async () => {
    const Admin = await getAccountAddress('Admin');
    const Sender = await getAccountAddress('Sender');

    // Mint NFTs
    const args = [
      Sender,
      [1, 1],
      [
        'https://i.natgeofe.com/n/46b07b5e-1264-42e1-ae4b-8a021226e2d0/domestic-cat_thumb_square.jpg',
        'https://www.thesprucepets.com/thmb/QDw4vt7XXQejL2IRztKeRLow6hA=/2776x1561/smart/filters:no_upscale()/cat-talk-eyes-553942-hero-df606397b6ff47b19f3ab98589c3e2ce.jpg',
      ],
      [
        {
          name: 'CatNft1',
          url: 'https://i.natgeofe.com/n/46b07b5e-1264-42e1-ae4b-8a021226e2d0/domestic-cat_thumb_square.jpg',
        },
        {
          name: 'CatNft2',
          url: 'https://www.thesprucepets.com/thmb/QDw4vt7XXQejL2IRztKeRLow6hA=/2776x1561/smart/filters:no_upscale()/cat-talk-eyes-553942-hero-df606397b6ff47b19f3ab98589c3e2ce.jpg',
        },
      ],
    ];
    const [mintNftsResult, mintNftsError] = await sendTransaction('mint_nfts', [Admin], args);
    expect(mintNftsResult).toBeNull();
    expect(mintNftsError.toString()).toContain('error: panic: Could not get receiver reference to the NFT Collection');
  });

  test('Mint NFTs Successfully', async () => {
    const Admin = await getAccountAddress('Admin');
    const Sender = await getAccountAddress('Sender');

    // Create Collection to Sender
    const [createCollectionResult, createCollectionError] = await sendTransaction('create_collection', [Sender], []);
    expect(createCollectionResult.statusString).toEqual('SEALED');
    expect(createCollectionError).toBeNull();

    // Mint NFTs
    const args = [
      Sender,
      [1, 1],
      [
        'https://i.natgeofe.com/n/46b07b5e-1264-42e1-ae4b-8a021226e2d0/domestic-cat_thumb_square.jpg',
        'https://www.thesprucepets.com/thmb/QDw4vt7XXQejL2IRztKeRLow6hA=/2776x1561/smart/filters:no_upscale()/cat-talk-eyes-553942-hero-df606397b6ff47b19f3ab98589c3e2ce.jpg',
      ],
      [
        {
          name: 'CatNft1',
          url: 'https://i.natgeofe.com/n/46b07b5e-1264-42e1-ae4b-8a021226e2d0/domestic-cat_thumb_square.jpg',
        },
        {
          name: 'CatNft2',
          url: 'https://www.thesprucepets.com/thmb/QDw4vt7XXQejL2IRztKeRLow6hA=/2776x1561/smart/filters:no_upscale()/cat-talk-eyes-553942-hero-df606397b6ff47b19f3ab98589c3e2ce.jpg',
        },
      ],
    ];
    const [mintNftsResult, mintNftsError] = await sendTransaction('mint_nfts', [Admin], args);
    expect(mintNftsResult.statusString).toEqual('SEALED');
    expect(mintNftsError).toBeNull();
  });

  test('Mint NFTs Failed due to missing of arguments', async () => {
    const Admin = await getAccountAddress('Admin');
    const Sender = await getAccountAddress('Sender');

    // Create Collection to Sender
    const [createCollectionResult, createCollectionError] = await sendTransaction('create_collection', [Sender], []);
    expect(createCollectionResult.statusString).toEqual('SEALED');
    expect(createCollectionError).toBeNull();

    // Mint NFTs
    const args = [
      Sender,
      [1, 1],
      [
        'https://i.natgeofe.com/n/46b07b5e-1264-42e1-ae4b-8a021226e2d0/domestic-cat_thumb_square.jpg',
        'https://www.thesprucepets.com/thmb/QDw4vt7XXQejL2IRztKeRLow6hA=/2776x1561/smart/filters:no_upscale()/cat-talk-eyes-553942-hero-df606397b6ff47b19f3ab98589c3e2ce.jpg',
      ],
    ];
    const [mintNftsResult, mintNftsError] = await sendTransaction('mint_nfts', [Admin], args);

    expect(mintNftsResult).toBeNull();
    expect(mintNftsError.toString()).toContain('Error: Not enough arguments');
  });

  test('Mint NFTs Failed due to invalid argument', async () => {
    const Admin = await getAccountAddress('Admin');
    const Sender = await getAccountAddress('Sender');

    // Create Collection to Sender
    const [createCollectionResult, createCollectionError] = await sendTransaction('create_collection', [Sender], []);
    expect(createCollectionResult.statusString).toEqual('SEALED');
    expect(createCollectionError).toBeNull();

    // Mint NFTs
    const args = [
      Sender,
      //invalid argument
      [1],
      [
        'https://i.natgeofe.com/n/46b07b5e-1264-42e1-ae4b-8a021226e2d0/domestic-cat_thumb_square.jpg',
        'https://www.thesprucepets.com/thmb/QDw4vt7XXQejL2IRztKeRLow6hA=/2776x1561/smart/filters:no_upscale()/cat-talk-eyes-553942-hero-df606397b6ff47b19f3ab98589c3e2ce.jpg',
      ],
      [
        {
          name: 'CatNft1',
          url: 'https://i.natgeofe.com/n/46b07b5e-1264-42e1-ae4b-8a021226e2d0/domestic-cat_thumb_square.jpg',
        },
        {
          name: 'CatNft2',
          url: 'https://www.thesprucepets.com/thmb/QDw4vt7XXQejL2IRztKeRLow6hA=/2776x1561/smart/filters:no_upscale()/cat-talk-eyes-553942-hero-df606397b6ff47b19f3ab98589c3e2ce.jpg',
        },
      ],
    ];
    const [mintNftsResult, mintNftsError] = await sendTransaction('mint_nfts', [Admin], args);

    expect(mintNftsResult).toBeNull();
  });
});

describe('Get NFTs', () => {
  test('Get NFTs after mint', async () => {
    const Sender = await getAccountAddress('Sender');

    const [getNftsResult, getNftsError] = await executeScript('get_nft_items', [Sender]);
    expect(getNftsResult.length).toEqual(2);
    expect(getNftsError).toBeNull();
    getNftsResult.forEach(item => {
      if (item.id === 0) {
        expect(item.typeID).toEqual(1);
        expect(item.urlData).toEqual('https://i.natgeofe.com/n/46b07b5e-1264-42e1-ae4b-8a021226e2d0/domestic-cat_thumb_square.jpg');
        expect(item.metadata.name).toEqual('CatNft1');
        expect(item.metadata.url).toEqual('https://i.natgeofe.com/n/46b07b5e-1264-42e1-ae4b-8a021226e2d0/domestic-cat_thumb_square.jpg');
      }
      if (item.id === 1) {
        expect(item.typeID).toEqual(1);
        expect(item.urlData).toEqual('https://www.thesprucepets.com/thmb/QDw4vt7XXQejL2IRztKeRLow6hA=/2776x1561/smart/filters:no_upscale()/cat-talk-eyes-553942-hero-df606397b6ff47b19f3ab98589c3e2ce.jpg');
        expect(item.metadata.name).toEqual('CatNft2');
        expect(item.metadata.url).toEqual('https://www.thesprucepets.com/thmb/QDw4vt7XXQejL2IRztKeRLow6hA=/2776x1561/smart/filters:no_upscale()/cat-talk-eyes-553942-hero-df606397b6ff47b19f3ab98589c3e2ce.jpg');
      }
    });
  });

  test('Get NFTs Failed when account does not create collection yet', async () => {
    const AnyUser = await getAccountAddress('AnyUser');

    const [getNftsResult, getNftsError] = await executeScript('get_nft_items', [AnyUser]);

    expect(getNftsResult).toBeNull();
    expect(getNftsError.toString()).toContain('error: panic: Could not borrow the receiver reference');
  });
});

describe('Transfer NFTs', () => {
  test('Transfer NFTs Failed when Receiver does not create collection', async () => {
    const Sender = await getAccountAddress('Sender');
    const Receiver = await getAccountAddress('Receiver');

    // Transfer NFT from Sender to Receiver
    const [transferNftsResult, transferNftsError] = await sendTransaction('transfer_nft', [Sender], [Receiver, [1]]);

    expect(transferNftsResult).toBeNull();
    expect(transferNftsError.toString()).toContain('error: panic: Could not borrow receiver reference');
  });

  test('Transfer NFTs Failed when Sender does not create collection', async () => {
    const AnyUser = await getAccountAddress('AnyUser');
    const Receiver = await getAccountAddress('Receiver');

    // Create Collection to Receiver
    const [createCollectionResult, createCollectionError] = await sendTransaction('create_collection', [Receiver], []);
    expect(createCollectionResult.statusString).toEqual('SEALED');
    expect(createCollectionError).toBeNull();

    // Transfer NFT from AnyUser to Receiver
    const [transferNftsResult, transferNftsError] = await sendTransaction('transfer_nft', [AnyUser], [Receiver, [1]]);

    expect(transferNftsResult).toBeNull();
    expect(transferNftsError.toString()).toContain("error: panic: Could not borrow a reference to the owner's collection");
  });

  test('Transfer NFTs Successfully', async () => {
    const Sender = await getAccountAddress('Sender');
    const Receiver = await getAccountAddress('Receiver');

    // Create Collection to Receiver
    const [createCollectionResult, createCollectionError] = await sendTransaction('create_collection', [Receiver], []);
    expect(createCollectionResult.statusString).toEqual('SEALED');
    expect(createCollectionError).toBeNull();

    // Transfer NFT from Sender to Receiver
    const [transferNftsResult, transferNftsError] = await sendTransaction('transfer_nft', [Sender], [Receiver, [1]]);
    expect(transferNftsResult.statusString).toEqual('SEALED');
    expect(transferNftsError).toBeNull();
  });

  test('Transfer NFTs Failed when NFT does not exist', async () => {
    const Sender = await getAccountAddress('Sender');
    const Receiver = await getAccountAddress('Receiver');

    // Create Collection to Receiver
    const [createCollectionResult, createCollectionError] = await sendTransaction('create_collection', [Receiver], []);
    expect(createCollectionResult.statusString).toEqual('SEALED');
    expect(createCollectionError).toBeNull();

    // Transfer NFT from Sender to Receiver
    const [transferNftsResult, transferNftsError] = await sendTransaction('transfer_nft', [Sender], [Receiver, [1]]);

    expect(transferNftsResult).toBeNull();
    expect(transferNftsError.toString()).toContain('error: panic: missing NFT');
  });
});

describe('Get NFTs', () => {
  test('Get NFTs after transfer', async () => {
    const Sender = await getAccountAddress('Sender');
    const Receiver = await getAccountAddress('Receiver');

    // Get Nfts of Sender
    const [senderNftsResult, senderNftsError] = await executeScript('get_nft_items', [Sender]);
    expect(senderNftsResult.length).toEqual(1);
    expect(senderNftsError).toBeNull();
    expect(senderNftsResult[0].typeID).toEqual(1);
    expect(senderNftsResult[0].urlData).toEqual('https://i.natgeofe.com/n/46b07b5e-1264-42e1-ae4b-8a021226e2d0/domestic-cat_thumb_square.jpg');
    expect(senderNftsResult[0].metadata.name).toEqual('CatNft1');
    expect(senderNftsResult[0].metadata.url).toEqual('https://i.natgeofe.com/n/46b07b5e-1264-42e1-ae4b-8a021226e2d0/domestic-cat_thumb_square.jpg');

    // Get Nfts of Receiver
    const [receiverNftsResult, receiverNftsError] = await executeScript('get_nft_items', [Receiver]);
    expect(receiverNftsResult.length).toEqual(1);
    expect(receiverNftsError).toBeNull();
    expect(receiverNftsResult[0].typeID).toEqual(1);
    expect(receiverNftsResult[0].urlData).toEqual('https://www.thesprucepets.com/thmb/QDw4vt7XXQejL2IRztKeRLow6hA=/2776x1561/smart/filters:no_upscale()/cat-talk-eyes-553942-hero-df606397b6ff47b19f3ab98589c3e2ce.jpg');
    expect(receiverNftsResult[0].metadata.name).toEqual('CatNft2');
    expect(receiverNftsResult[0].metadata.url).toEqual('https://www.thesprucepets.com/thmb/QDw4vt7XXQejL2IRztKeRLow6hA=/2776x1561/smart/filters:no_upscale()/cat-talk-eyes-553942-hero-df606397b6ff47b19f3ab98589c3e2ce.jpg');
  });
});

// Burn Nft of Receiver
describe('Burn NFTs', () => {
  test('Burn NFTs Successfully', async () => {
    const Admin = await getAccountAddress('Admin');
    const Receiver = await getAccountAddress('Receiver');

    const [burnNftsResult, burnNftsError] = await sendTransaction('burn_nft', [Admin, Receiver], [1]);

    expect(burnNftsResult.statusString).toEqual('SEALED');
    expect(burnNftsError).toBeNull();
  });

  test('Burn NFTs Failed when NFT does not exist', async () => {
    const Admin = await getAccountAddress('Admin');
    const Receiver = await getAccountAddress('Receiver');

    const [burnNftsResult, burnNftsError] = await sendTransaction('burn_nft', [Admin, Receiver], [1]);

    expect(burnNftsResult).toBeNull();
    expect(burnNftsError.toString()).toContain('error: panic: missing NFT');
  });
});

describe('Get NFTs', () => {
  test('Get NFTs after burn', async () => {
    const Sender = await getAccountAddress('Sender');
    const Receiver = await getAccountAddress('Receiver');

    // Get Nfts of Sender
    const [senderNftsResult, senderNftsError] = await executeScript('get_nft_items', [Sender]);
    expect(senderNftsResult.length).toEqual(1);
    expect(senderNftsError).toBeNull();
    expect(senderNftsResult[0].typeID).toEqual(1);
    expect(senderNftsResult[0].urlData).toEqual('https://i.natgeofe.com/n/46b07b5e-1264-42e1-ae4b-8a021226e2d0/domestic-cat_thumb_square.jpg');
    expect(senderNftsResult[0].metadata.name).toEqual('CatNft1');
    expect(senderNftsResult[0].metadata.url).toEqual('https://i.natgeofe.com/n/46b07b5e-1264-42e1-ae4b-8a021226e2d0/domestic-cat_thumb_square.jpg');

    // Get Nfts of Receiver
    const [receiverNftsResult, receiverNftsError] = await executeScript('get_nft_items', [Receiver]);
    expect(receiverNftsResult.length).toEqual(0);
    expect(receiverNftsError).toBeNull();
  });
});

import PunchNFTs from 0xPunchNFTsAddress

// Print the NFTs owned by account.
pub fun main(recipient: Address): [&PunchNFTs.NFT?] {
  // Get the public account object for account
  let nftOwner = getAccount(recipient)

  // Find the public Receiver capability for their Collection
  let capability = nftOwner.getCapability<&PunchNFTs.Collection{PunchNFTs.PunchNFTsCollectionPublic}>(PunchNFTs.CollectionPublicPath)

  // borrow a reference from the capability
  let receiverRef = capability.borrow()
      ?? panic("Could not borrow the receiver reference")

  let IDs = receiverRef.getIDs()

  let NFTs: [&PunchNFTs.NFT?] = []

  for element in IDs {
    NFTs.append(receiverRef.borrowPunchNFT(id: element))
  }
  // Log the NFTs that they own as an array of IDs
  log(NFTs)

  return NFTs
}

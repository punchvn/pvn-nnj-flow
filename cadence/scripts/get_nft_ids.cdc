import PunchNFTs from 0xPunchNFTsAddress

pub fun main(recipient: Address): [UInt64] {
  // Get the public account object for account
  let nftOwner = getAccount(recipient)

  // Find the public Receiver capability for their Collection
  let capability = nftOwner.getCapability<&PunchNFTs.Collection{PunchNFTs.PunchNFTsCollectionPublic}>(PunchNFTs.CollectionPublicPath)

  // borrow a reference from the capability
  let receiverRef = capability.borrow()
      ?? panic("Could not borrow the receiver reference")

  let IDs = receiverRef.getIDs()

  return IDs
}

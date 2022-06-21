import NonFungibleToken from 0xNonFungibleTokenAddress
import PunchNFTs from 0xPunchNFTsAddress

// This transaction transfers an NFT from one user's collection
// to another user's collection.
transaction (recipient: Address, ids: [UInt64]) {
  // The field that will hold the NFT as it is being
  // transferred to the other account
  let transferToken: @[NonFungibleToken.NFT]
  
  prepare(acct: AuthAccount) {
    // Borrow a reference from the stored collection
    let collectionRef = acct.borrow<&PunchNFTs.Collection>(from: PunchNFTs.CollectionStoragePath)
        ?? panic("Could not borrow a reference to the owner's collection")
    
    self.transferToken <- []
    
    for id in ids {
      self.transferToken.append(<-collectionRef.withdraw(withdrawID: id))
    }
  }

  execute {
    // Get the recipient's public account object
    let targetAccount = getAccount(recipient)

    // Get the Collection reference for the receiver
    // getting the public capability and borrowing a reference from it
    let capability = targetAccount.getCapability<&PunchNFTs.Collection{PunchNFTs.PunchNFTsCollectionPublic}>(PunchNFTs.CollectionPublicPath)

    let receiverRef = capability.borrow()
        ?? panic("Could not borrow receiver reference")

    // Deposit the NFTs in the receivers collection
    var i = 0;
    while i < self.transferToken.length {
      let res <- self.transferToken.remove(at: i)
      receiverRef.deposit(token: <- res)
    }

    destroy self.transferToken

    log("NFT transferred")
  }
}

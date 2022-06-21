import NonFungibleToken from 0xNonFungibleTokenAddress
import PunchNFTs from 0xPunchNFTsAddress

transaction(id: UInt64) {
  // local variable for storing the minter reference
  let burner: &PunchNFTs.NFTBurner
  let burnToken: @NonFungibleToken.NFT

  prepare(signer: AuthAccount, owner: AuthAccount) {
    // borrow a reference to the NFTMinter resource in storage
    self.burner = signer.borrow<&PunchNFTs.NFTBurner>(from: PunchNFTs.BurnerStoragePath)
        ?? panic("Could not borrow a reference to the NFT burner")
    
    // Borrow a reference from the stored collection
    let collectionRef = owner.borrow<&PunchNFTs.Collection>(from: PunchNFTs.CollectionStoragePath)
        ?? panic("Could not borrow a reference to the owner's collection")

    self.burnToken<-collectionRef.withdraw(withdrawID: id)
  }

  execute {
    self.burner.burn(token: <-self.burnToken)
    log("NFT burned")
  }
}

import NonFungibleToken from 0xNonFungibleTokenAddress
import PunchNFTs from 0xPunchNFTsAddress

transaction() {
  let existCollection: Bool

  prepare(signer: AuthAccount) {
    // if the account doesn't already have a collection
    if signer.borrow<&PunchNFTs.Collection>(from: PunchNFTs.CollectionStoragePath) == nil {
      // create a new empty collection
      let collection <- PunchNFTs.createEmptyCollection()
      // save it to the account
      signer.save(<-collection, to: PunchNFTs.CollectionStoragePath)
      // create a public capability for the collection
      signer.link<&PunchNFTs.Collection{PunchNFTs.PunchNFTsCollectionPublic}>(PunchNFTs.CollectionPublicPath, target: PunchNFTs.CollectionStoragePath)
    }
    self.existCollection = signer.borrow<&PunchNFTs.Collection>(from: PunchNFTs.CollectionStoragePath) != nil
  }

  post {
    self.existCollection : "Collection was not created correctly"
  }
}

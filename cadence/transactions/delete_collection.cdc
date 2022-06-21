import PunchNFTs from 0xPunchNFTsAddress

transaction() {
  prepare(signer: AuthAccount) {
    if signer.borrow<&PunchNFTs.Collection>(from: PunchNFTs.CollectionStoragePath) != nil {
      let collectionRef <- signer.load<@PunchNFTs.Collection>(from: PunchNFTs.CollectionStoragePath)
          ?? panic("Could not borrow collection reference")
      destroy collectionRef
      signer.unlink(PunchNFTs.CollectionPublicPath)
    }
  }
}

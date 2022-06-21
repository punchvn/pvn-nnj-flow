import PunchNFTs from 0xPunchNFTsAddress

transaction(recipient: Address, typeIDs: [UInt64], urlDatas: [String], metadatas: [{String: String}]) {
  // local variable for storing the minter reference
  let minter: &PunchNFTs.NFTMinter

  prepare(signer: AuthAccount) {
    // borrow a reference to the NFTMinter resource in storage
    self.minter = signer.borrow<&PunchNFTs.NFTMinter>(from: PunchNFTs.MinterStoragePath)
        ?? panic("Could not borrow a reference to the NFT minter")
  }

  execute {
    // get the public account object for the recipient
    let recipient = getAccount(recipient)

    // borrow the recipient's public NFT collection reference
    let receiver = recipient
        .getCapability(PunchNFTs.CollectionPublicPath)!
        .borrow<&PunchNFTs.Collection{PunchNFTs.PunchNFTsCollectionPublic}>()
        ?? panic("Could not get receiver reference to the NFT Collection")

    // mint the NFT and deposit it to the recipient's collection
    var i = 0
    while i < urlDatas.length {
      let urlData = urlDatas[i]
      let metadata = metadatas[i]
      let typeID = typeIDs[i]
      i = i + 1
      self.minter.mintNFT(recipient: receiver, typeID: typeID, urlData: urlData, metadata: metadata)
    }
  }
}

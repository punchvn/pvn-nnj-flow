import PunchNFTs from 0xPunchNFTsAddress

pub fun main(addr: Address): Bool {
  let ref = getAccount(addr).getCapability<&PunchNFTs.Collection{PunchNFTs.PunchNFTsCollectionPublic}>(PunchNFTs.CollectionPublicPath).check()
  return ref
}

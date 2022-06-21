import FlowToken from 0xFlowTokenAddress
import FungibleToken from 0xFungibleTokenAddress

pub fun main(recipient: Address): UFix64 {
  let vaultRef = getAccount(recipient)
      .getCapability(/public/flowTokenBalance)
      .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
      ?? panic("Could not borrow Balance reference to the Vault")

  return vaultRef.balance
}

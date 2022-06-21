// import NonFungibleToken from 0xNFTADDRESS
import NonFungibleToken from 0xNonFungibleTokenAddress

pub contract PunchNFTs: NonFungibleToken {
  
    // Events
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event Minted(id: UInt64, typeID: UInt64)
    pub event TokensBurned(id: UInt64)

    // Named Storage Paths
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let MinterStoragePath: StoragePath
    pub let BurnerStoragePath: StoragePath

    // totalSupply
    // The current NFT amount ( not be burned )
    pub var totalSupply: UInt64

    // The total number of PunchNFTs that have been minted
    pub var mintedAmount: UInt64

    // The burned ids
    pub var burnedIds: [UInt64]

    // Requirement that all conforming NFT smart contracts have
    // to define a resource called NFT that conforms to INFT
    pub resource NFT: NonFungibleToken.INFT {
        // The token's ID
        pub let id: UInt64
        // The token's type
        pub let typeID: UInt64

        // String mapping to hold metadata
        access(self) var metadata: {String: String}
        // urlData: the image url
        pub var urlData: String

        // initializer
        init(initID: UInt64, initTypeID: UInt64, urlData: String, metadata: {String: String}?) {
            self.id = initID
            self.typeID = initTypeID
            self.urlData = urlData
            self.metadata = metadata ?? {}
        }

        pub fun getMetadata(): {String:String} {
	        return self.metadata
        }
    }

    // This is the interface that users can cast their PunchNFTs Collection as
    // to allow others to deposit PunchNFTs into their Collection. It also allows for reading
    // the details of PunchNFTs in the Collection.
    pub resource interface PunchNFTsCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowPunchNFT(id: UInt64): &PunchNFTs.NFT? {
            // If the result isn't nil, the id of the returned reference
            // should be the same as the argument to the function
            post {
                (result == nil) || (result?.id == id):
                    "Cannot borrow Punch reference: The ID of the returned reference is incorrect"
            }
        }
    }

    // Requirement for the the concrete resource type
    // to be declared in the implementing contract
    pub resource Collection: PunchNFTsCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic {

        // Dictionary to hold the NFTs in the Collection
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        // withdraw
        // Removes an NFT from the collection and moves it to the caller
        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")

            emit Withdraw(id: token.id, from: self.owner?.address)

            return <-token
        }

        // deposit
        // Takes a NFT and adds it to the collections dictionary
        // and adds the ID to the id array
        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @PunchNFTs.NFT

            let id: UInt64 = token.id

            // add the new token to the dictionary which removes the old one
            let oldToken <- self.ownedNFTs[id] <- token

            emit Deposit(id: id, to: self.owner?.address)

            destroy oldToken
        }

        // getIDs
        // Returns an array of the NFT IDs that are in the collection
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        // borrowNFT
        // Gets a reference to an NFT in the collection
        // so that the caller can read its metadata and call its methods
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }

        // borrowPunchNFT
        // Gets a reference to an NFT in the collection as a Punch,
        // exposing all of its fields (including the typeID).
        // This is safe as there are no functions that can be called on the Punch.
        pub fun borrowPunchNFT(id: UInt64): &PunchNFTs.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref =(&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                return ref as! &PunchNFTs.NFT
            } else {
                return nil
            }
        }

        // destructor
        destroy() {
            destroy self.ownedNFTs
        }

        // initializer
        init () {
            self.ownedNFTs <- {}
        }
    }

    // createEmptyCollection creates an empty Collection
    // and returns it to the caller so that they can own NFTs
    pub fun createEmptyCollection(): @PunchNFTs.Collection {
        return <- create Collection()
    }

    // NFTMinter
    // Resource that an admin or something similar would own to be
    // able to mint new NFTs
    pub resource NFTMinter {

        // mintNFT
        // Mints a new NFT with a new ID
        // and deposit it in the recipients collection using their collection reference
        pub fun mintNFT(recipient: &PunchNFTs.Collection{PunchNFTs.PunchNFTsCollectionPublic}, typeID: UInt64, urlData: String, metadata: {String: String}) {
            // deposit it in the recipient's account using their reference
            recipient.deposit(token: <-create PunchNFTs.NFT(initID: PunchNFTs.mintedAmount, initTypeID: typeID, urlData: urlData, metadata: metadata))
            emit Minted(id: PunchNFTs.mintedAmount, typeID: typeID)
            PunchNFTs.totalSupply = PunchNFTs.totalSupply + 1
            PunchNFTs.mintedAmount = PunchNFTs.mintedAmount + 1
        }

        // fetch
        // Get a reference to a PunchNFT from an account's Collection, if available.
        // If an account does not have a PunchNFTs.Collection, panic.
        // If it has a collection but does not contain the itemID, return nil.
        // If it has a collection and that collection contains the itemID, return a reference to that.
        pub fun fetch(_ from: Address, itemID: UInt64): &PunchNFTs.NFT? {
            let collection = getAccount(from)
                .getCapability(PunchNFTs.CollectionPublicPath)
                .borrow<&PunchNFTs.Collection{PunchNFTs.PunchNFTsCollectionPublic}>()
                ?? panic("Couldn't get collection")
            // We trust PunchNFTs.Collection.borowPunch to get the correct itemID
            // (it checks before returning it).
            return collection.borrowPunchNFT(id: itemID)
        }
    }

    pub resource NFTBurner {
        pub fun burn(token: @NonFungibleToken.NFT) {
            let token <- token as! @PunchNFTs.NFT
            let id: UInt64 = token.id

            destroy token

            emit TokensBurned(id: id)

            PunchNFTs.burnedIds.append(id)
            PunchNFTs.totalSupply = PunchNFTs.totalSupply - 1
        }
    }
    // initializer
    init() {
        // Set our named storage paths
        self.CollectionStoragePath = /storage/PunchNFTsCollection
        self.CollectionPublicPath = /public/PunchNFTsPublicCollection
        self.MinterStoragePath = /storage/PunchNFTsMinter
        self.BurnerStoragePath = /storage/PunchNFTsBurner

        // Initialize value
        self.totalSupply = 0
        self.mintedAmount = 0
        self.burnedIds = []

        // store an empty NFT Collection in account storage
        self.account.save(<-self.createEmptyCollection(), to: self.CollectionStoragePath)

        // publish a reference to the Collection in storage
        self.account.link<&PunchNFTs.Collection{PunchNFTs.PunchNFTsCollectionPublic}>(self.CollectionPublicPath, target: self.CollectionStoragePath)

        // Create a Minter resource and save it to storage
        let minter <- create NFTMinter()
        let burner <- create NFTBurner()

        self.account.save(<-minter, to: self.MinterStoragePath)
        self.account.save(<-burner, to: self.BurnerStoragePath)

        emit ContractInitialized()
    }
}

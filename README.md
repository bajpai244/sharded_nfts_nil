# Sharded NFTs =nil;

Let's explore sharded NFTs?

## Warning

---

The code is currently hacky! **But works!** Improvements on the way :)

<img src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmdzeG1oOHY2dGwzdGhpbnQ0dDI2OGRtMTE2c29vbjhsaXI5NHFsbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wJ8QGSXasDvPy/giphy.gif">

**Why NFTs?**

---

The first and obvious question is, why?

NFTs are a proven use case across all blockchains, and they have often reflected the scaling issues with the current blockchain networks like Solana and Ethereum.

Take [this](https://blockworks.co/news/solana-and-ethereum-suffer-weekend-disruptions-thanks-to-nft-mints) article, for example, talks about how Solana was halted for hours while Ethereum became too expensive to use during the mint of [Otherside](https://otherside.xyz/); **more than 180 million USD worth of ETH** was consumed during this mint back in 2022!

> Hence, simulating high-volume NFT mints, like the 95000 Virtual Land NFTs in the Otherside case, can be a great way to see the benefits of using a sharded architecture in blockchains.

## NFTs are just a bunch of records stored on chain

---

In their simplest form, NFTs are just a series of records stored on the Blockchain State! It is a mapping storing `address → nft_token_id`.

<img width="500px" src="./assets/nfts_are_bunch_records.png">

## EVM only does operation at a time ⚠️

---

As we speak, most of the EVM chains lack paralleization and can only process one transaction at a time, which means that if 2 people want to mint/sell an NFT collection, one would be done before another!

In the below case, if some wants to transfer there NFT, and if they are the only person who wants to do it { + if this is the only operation on the chain }! Then they will get immediate access to the EVM, and the EVM based on their transaction will update the mapping and produce the new blockchain state.

<img width="900px" src="./assets/evm_only_1_operation.png">

If, there were two EOAs who want to transfer, mint or any other operation on their relative NFT, then one of them will get access to the VM before the another.

<img width="900px" src="./assets/two_eoa_at_a_time.png">

Now, this scenario will play good enough till we have a few number of such requests! Ethereum can do 10-20 TPS, while some EVM L2s can do 40-50 { some can even claim 100+ TPS }.

But, this is still not enough for scenarios where there is high demand for blockspace for such Tokens!

> For example take, launch of an RWA where someone is tokenizing 100k shares of an RWA, so at the time of the launch there is demand for 100k Token Mints!

> If we take an average TPS per EVM chain to be around 50 TPS, that is still on average 2000 seconds of wait time! Which is 33 minutes on average per mint!

> Imagine the gas fees spikes as so many people want to access the same the VM at the same time, this will exclude so many people who want to particiapate in this RWA, who just simply cannot participate as they cannot outbid whales for gas! { this is truly a question of financial inclusion! }

<img width="900px" src="./assets/many_people_using.png" />

## Exploring Sharding as a solution for this!

---

Now, in a sharded blockchain like `=nil;` this NFT data on top of which transactions are processed, can be splitted across multiple shards, [as discussed](https://www.notion.so/Sharded-NFTs-with-nil-bb298accf8ed42739033b191d0ec1fc2?pvs=21) that NFTs are just a bunch of records on chain. You can split these records across multiple shards and unlock parallel compute over the collection for transactions that touch different shards as part of their execution!

<img widht="900px" src="./assets/sharded_solution.png"  />

For example in the above diagram, various Token IDs have been equally splitted across the 4 shards.

- this way if there are 95000 NFT as in case of otherside, it will be 95000/N number of records per shard!
- If we consider an average of 30 TPS per shard { 15 TPS already observed as part of benchmarking on =nil; }, let’s look at the average tx time as the number of shard increase:

<img src="./assets/table.png" />

## Implementation

We have made use of shard aware contracts!

We deploy multiple contracts across multiple shards, where each shard only handles totalToken/totalNumberOfShards tokens!

This divides the state horizontally across number of shards.

We extend the Ethereum ERC721, and make use of a new function and modifier to achieve horizontal scaling!

## `getShard`

This function allows getting the shardID whose contract is responible for managing a specific tokenId state.

```
 // function which our NFT contract can call on the shard to find which token ragnes are valid for its shard
    function getShardID(uint256 tokenID) public view returns (uint256) {
        // totalSupply is stored as part of the contract where this function lives
        require(tokenID < totalSupply, "Invalid tokenID");

        // numberOfShards is stored as part of the contract as well
        uint256 tokensPerShard = totalSupply / numberOfShards;
        uint256 shardID = tokenID / tokensPerShard;

        // Ensure shardID does not exceed the number of shards
        if (shardID >= numberOfShards) {
            shardID = numberOfShards - 1;
        }

        return shardID;
    }
```

## `onlyThisShard(uint256 tokenId)`

This modifier is applied to all state updating or view functions of ERC721 which operate on a specific token ID. It acts as a guard to make sure that a contract is only handling state of the tokenID it is managing!

```
    /**
     * @dev Throws if the token ID doesn't belong to this shard
     */
    modifier onlyThisShard(uint256 tokenId) {
        require(getShardID(tokenId) == shardId, "Token does not belong to this shard");
        _;
    }
```

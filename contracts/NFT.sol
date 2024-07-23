// contracts/NonFunToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC721 } from "./ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ShardedNFT is ERC721, Ownable {

    /**
     * @dev Throws if the token ID doesn't belong to this shard
     */
    modifier onlyThisShard(uint256 tokenId) {
        require(getShardID(tokenId) == shardId, "Token does not belong to this shard");
        _;
    }

    uint256 public shardId;
    uint256 public totalSupply;
    uint256 public numberOfShards;

    // Constructor will be called on contract creation
    constructor(uint256 _shardId, uint256 _numberOfShards, uint256 _totalSupply) ERC721("ShardedNFTToken", "SNT") Ownable(msg.sender) payable {
        shardId = _shardId;
        numberOfShards = _numberOfShards;
        totalSupply = _totalSupply;
    }

    // Allows minting of a new NFT
    function mintTo(address collector, uint256 tokenId) public onlyOwner() onlyThisShard(tokenId) payable{
        _safeMint(collector, tokenId);
    }

     /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual override onlyThisShard(tokenId) returns (address) {
        return super.ownerOf(tokenId);
    }

     /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view override onlyThisShard(tokenId) returns (string memory) {
        return super.tokenURI(tokenId);
    }


    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public override onlyThisShard(tokenId) {
        return super.approve(to, tokenId);
    }

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId) public view override onlyThisShard(tokenId) returns (address) {
        return super.getApproved(tokenId);
    }

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(address from, address to, uint256 tokenId) public override onlyThisShard(tokenId) {
        return super.transferFrom(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override onlyThisShard(tokenId) {
        super.safeTransferFrom(from, to, tokenId, data);
    }

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
}

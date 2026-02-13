# DarkPool System Integration Guide

This document is intended for Market Makers (MM), explaining how MMs can deploy Vault contracts, manage market-making funds, establish connections with the Swap Engine (SE), and complete quote interactions.

---

## 1\. Prerequisites

### 1.1 Signer Account Configuration

- **Prepare Signer Account**: MM needs a Signer account address for signing quotes  
- **Provide Address**: Submit the Signer account address to Deluthium team  
- **Obtain Token**: Get a Bearer Token (JWT) for authentication when establishing WebSocket connection with SE

### 1.2 Deploy Vault Contract

Deploy the [`MMVaultExample.sol`](https://drive.google.com/open?id=16O3m7oFPGCGZmTTvSSrBBmH5IodXOevN) contract (see Appendix) to hold market-making funds.

**Deployment Command**

forge create src/MMVaultExample.sol:MMVaultExample \\

  \--rpc-url $RPC\_URL \\

  \--private-key $PRIVATE\_KEY \\

  \--constructor-args \<WETH9\_ADDRESS\>

**Constructor Parameters**:

- `WETH9_ADDRESS`: The WETH9 (Wrapped ETH) contract address on the target chain

| Chain | WETH9 Address |
| :---- | :---- |
| BSC Mainnet | 0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c |
| BSC Testnet | 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd |

**Post-Deployment Configuration**

After deployment, the owner must configure the Vault to recognize the DarkPool Pool and Router:  
Production：

- **Set RFQ Manager Address**: Call `setRFQManager(address _rfqManager)`  
    
  - BSC Mainnet RFQ Manager Address: `0x94020Af3571f253754e5566710A89666d90Df615`  
  - Base Mainnet RFQ Manager Address: 0x7648CE928efa92372E2bb34086421a8a1702bD36


- **Set Router Address**: Call `setRouter(address _router)`  
    
  - BSC Mainnet Router Address: `0xaAeD8af417B4bF80802fD1B0ccd44d8E15ba33Ff`  
  - Base Mainnet Router Address: 0xcd3cA39373A21EDF2d7E68C6596678525447Eb82  
    

### 1.3 Market-Making Fund Preparation

Deposit market-making funds into the deployed Vault contract (see "Section 2: On-Chain Contracts \- Fund Management").

### 1.4 Service Endpoints

| Environment | Base URL | Product Frontend URL |
| :---- | :---- | :---- |
| Production | `wss://mmhub.deluthium.ai/ws` | `https://deluthium.ai/en/swap-plus` |
|  |  |  |

MM Demo：https://github.com/thetafunction/DarkPool-Market-Maker-Example  
---

## 2\. On-Chain Contracts

### 2.1 Fund Management

The `MMVaultExample` contract holds funds for settling trades initiated by DarkPoolPool.

**Deposits**

- **Native Token (ETH/BNB)**:  
    
  - Send Native Token directly to the contract address  
  - The `receive()` function automatically wraps it to WETH9  
  - Note: Even if input/output is Native Token, the Vault internally uses WETH9 for settlement


- **ERC20 Tokens**:  
    
  - Use standard `transfer()` to send ERC20 tokens directly to the contract address

**Withdrawals**

Only the owner can withdraw funds.

- **Withdraw ERC20**: Call `withdrawERC20(address token, address to, uint256 amount)`  
    
  - `token`: ERC20 token address  
  - `to`: Destination address  
  - `amount`: Withdrawal amount


- **Withdraw Native Token**: Call `withdrawNative(address to, uint256 amount)`  
    
  - This function first unwraps the contract's WETH9, then sends Native Token to the `to` address

### 2.2 Signature Verification Process

DarkPool RFQ Manager uses EIP-712 signatures to verify off-chain quotes.

**Signature Structure**

Domain Separator:

- Name: "RFQ Manager"  
- Version: "1"  
- ChainId: `<current chain ID>`  
- VerifyingContract: `<DarkPool RFQ Manager address>`

Type Definition (MMQuote):

struct MMQuote {

    address manager;

    address from;

    address to;

    address inputToken;

    address outputToken;

    uint256 amountIn;

    uint256 amountOut;

    uint256 deadline;

    uint256 nonce;

    bytes32 extraDataHash;

}

**Note**: The Solidity struct has `bytes extraData`, but the EIP-712 hash uses `bytes32 extraDataHash`, which is `keccak256(extraData)`.

**Signature Generation Example (TypeScript)**

Dependencies: `npm install ethers dotenv`

import { ethers } from "ethers";

// \--- Configuration \---

const PRIVATE\_KEY \= process.env.MM\_PRIVATE\_KEY || "YOUR\_PRIVATE\_KEY\_HERE";

const DarkPool\_RFQ\_MANAGER\_ADDRESS \= "0x66947CC615630AEd7c2B02d0886d18A3a0348ECA";

const CHAIN\_ID \= 56; // BSC Mainnet: 56, BSC Testnet: 97

// \--- Type Definitions \---

interface MMQuoteParams {

    manager: string;

    from: string;

    to: string;

    inputToken: string;

    outputToken: string;

    amountIn: bigint;

    amountOut: bigint;

    deadline: number;

    nonce: bigint;

    extraData: string;

}

async function signMMQuote(params: MMQuoteParams) {

    const wallet \= new ethers.Wallet(PRIVATE\_KEY);

    // 1\. EIP-712 Domain

    const domain \= {

        name: "DarkPool Pool",

        version: "1",

        chainId: CHAIN\_ID,

        verifyingContract: DarkPool\_RFQ\_MANAGER\_ADDRESS,

    };

    // 2\. Type Definitions

    const types \= {

        MMQuote: \[

            { name: "manager", type: "address" },

            { name: "from", type: "address" },

            { name: "to", type: "address" },

            { name: "inputToken", type: "address" },

            { name: "outputToken", type: "address" },

            { name: "amountIn", type: "uint256" },

            { name: "amountOut", type: "uint256" },

            { name: "deadline", type: "uint256" },

            { name: "nonce", type: "uint256" },

            { name: "extraDataHash", type: "bytes32" },

        \],

    };

    // 3\. Calculate extraDataHash

    const extraDataHash \= ethers.keccak256(params.extraData);

    // 4\. Prepare signing data

    const value \= {

        manager: params.manager,

        from: params.from,

        to: params.to,

        inputToken: params.inputToken,

        outputToken: params.outputToken,

        amountIn: params.amountIn,

        amountOut: params.amountOut,

        deadline: params.deadline,

        nonce: params.nonce,

        extraDataHash: extraDataHash,

    };

    // 5\. Sign

    const signature \= await wallet.signTypedData(domain, types, value);

    console.log("Signer:", wallet.address);

    console.log("Signature:", signature);

    return signature;

}

// \--- Usage Example \---

async function main() {

    const quote: MMQuoteParams \= {

        manager: DarkPool\_RFQ\_MANAGER\_ADDRESS,

        from: "0xUserAddress...",

        to: "0xReceiverAddress...",

        inputToken: "0xInputTokenAddress...",

        outputToken: "0xOutputTokenAddress...",

        amountIn: ethers.parseUnits("1.0", 18),

        amountOut: ethers.parseUnits("0.99", 18),

        deadline: Math.floor(Date.now() / 1000\) \+ 3600,

        nonce: BigInt(Date.now()),

        extraData: "0x",

    };

    await signMMQuote(quote);

}

main();

### 2.3 Whitelist Management

The Vault contract controls call permissions through a whitelist mechanism:

| Function | Description | Authorized Address |
| :---- | :---- | :---- |
| `setRFQManager(address)` | Authorize DarkPoolRFQManager to call `swap()` | RFQManager contract address |
| `setRouter(address)` | Authorize Router to call `beforeSwap()` | Router contract address |

---

## 3\. MM and SE API Integration

**Transport Protocol**: WebSocket (binary frames) \+ Protobuf (`mm.v1.Message` as unified wrapper)

**Proto File**: `proto/mm/v1/mm.proto`

### 3.1 Overall Interaction Flow

┌─────────┐                              ┌─────────┐

│   MM              │                              │   SE                 │

└────┬────┘                              └────┬────┘

     │                                                                │

     │  1\. WebSocket Connection \+ Token Auth  │

     │ ─────────────────────────\>  │

     │                                                                   │

     │  2\. ConnectionAck (Connection Confirm) │

     │ \<────────────────────────  │

     │                                                                 │

     │  3\. DepthSnapshot (Order Book Push)    │

     │ ────────────────────────\>  │

     │        (Continuous full snapshot)               │

     │                                                                │

     │  4\. QuoteRequest (Quote Request)       │

     │ \<───────────────────────  │

     │                                                              │

     │  5\. QuoteResponse / QuoteReject        │

     │ ───────────────────────\>  │

     │                                                              │

     │  6\. Heartbeat (Bidirectional)               │

     │ \<──────────────────────\>   │

     │                                                               │

### 3.2 Creating Connection

**Connection Method**

MM actively initiates a WebSocket connection to SE's WS address (provided by SE deployer).

**Authentication Parameters**

MM needs to include Token in the request header:

Authorization: Bearer \<token\>

**ConnectionAck (SE → MM)**

After successful authentication, SE sends ConnectionAck:

- `Message.type = MESSAGE_TYPE_CONNECTION_ACK`  
- `Message.payload.connection_ack` is `ConnectionAck`

Upon receiving, MM should:

- If `success=false`: Log `error_message` and disconnect/retry  
- If `success=true`: Save `session_id` and `mm_address`, and read suggested parameters from `config` (push interval/timeout/heartbeat interval)

### 3.3 Order Book Push Interface (MM → SE)

**Message Type**

- `Message.type = MESSAGE_TYPE_DEPTH_SNAPSHOT`  
- `Message.payload.depth_snapshot = DepthSnapshot`

**Push Frequency**

Recommended to push at intervals specified by `ConnectionAck.config.depth_push_interval_ms`. If MM updates more frequently internally, it can increase the frequency, but note:

- Each push should be a **full snapshot** to simplify consistency handling for SE  
- `sequence_id` should be monotonically increasing (for debugging/tracking)

**DepthSnapshot Field Requirements (Strict Constraints)**

| Field | Description |
| :---- | :---- |
| bids | Sorted by price in **descending** order |
| asks | Sorted by price in **ascending** order |
| price | tokenB/tokenA (wei/wei ratio, string, preserve precision) |
| amount | tokenA quantity (wei, string, integer) |

**Important**: Pools/depths pushed by MM should use Wrapped Token addresses (see "Section 4: Native Token Handling").

### 3.4 FirmQuote Interface

**QuoteRequest (SE → MM)**

Message:

- `Message.type = MESSAGE_TYPE_QUOTE_REQUEST`  
- `Message.payload.quote_request = QuoteRequest`

Key Fields:

| Field | Description |
| :---- | :---- |
| quote\_id | Unique identifier for the request, used for routing responses |
| token\_in / token\_out | Quote token addresses (may be zero address) |
| amount\_in | Input amount |
| recipient | User's receiving address |
| nonce | Anti-replay (string) |
| deadline | Unix seconds |

**Implementation Note**: MM must route responses using `quote_id` as the key to ensure one-to-one correspondence with requests.

**QuoteResponse (MM → SE)**

Message:

- `Message.type = MESSAGE_TYPE_QUOTE_RESPONSE`  
- `Message.payload.quote_response = QuoteResponse`

Requirements on success:

- `status = QUOTE_STATUS_SUCCESS`  
- `order != nil`

order (SignedOrder) Key Fields:

| Field | Description |
| :---- | :---- |
| signer | MM signer address |
| `manager` | DarkPool RFQManager contract address |
| nonce | uint256 string |
| amount\_in | Input amount (string; wei integer) |
| amount\_out | Minimum output amount (string; wei integer) |
| deadline | Unix seconds |
| extra\_data | `abi.encode(v3Pool, zeroForOne, sqrtPriceLimit, callbackData)` |
| signature | EIP-712 signature (65 bytes) |

**QuoteReject (MM → SE)**

Message:

- `Message.type = MESSAGE_TYPE_QUOTE_REJECT`  
- `Message.payload.quote_reject = QuoteReject`

Recommendations:

- `reason` should select appropriate enum (insufficient liquidity/price change/unsupported pair/rate limiting/internal error, etc.)  
- `message` should provide readable error reason for SE-side log debugging

### 3.5 Heartbeat and Error Handling

**Heartbeat (Bidirectional)**

Message:

- `Message.type = MESSAGE_TYPE_HEARTBEAT`  
- `payload.heartbeat.ping/pong`

Recommendations:

- Reply with `pong=true` promptly upon receiving `ping=true`  
- Send heartbeats periodically even when idle to prevent NAT/intermediate device disconnection

**Error (Bidirectional)**

Message:

- `Message.type = MESSAGE_TYPE_ERROR`  
- `payload.error.code/message/related_quote_id`

When related to a specific quote, filling in `related_quote_id` helps SE quickly identify which quote failed.

### 3.6 Proto File

- **Proto Definition File**: [`proto/mm/v1/mm.proto`](https://drive.google.com/file/d/1RNLSPyDP0pRbgpyHTUVZYLK8t4-iqbAA/view?usp=sharing)  
- **Go Generated File**: [`proto/gen/mm/v1/mm.pb.go`](https://drive.google.com/file/d/1eQPBPNcIQ1IU9SdtSOTkubqsTnmM7_Nu/view?usp=sharing)

**Core Message List**

| Message | Description |
| :---- | :---- |
| Message | Unified wrapper |
| ConnectionAck / ConnectionConfig | Connection confirmation and server-suggested parameters |
| DepthSnapshot / PriceLevel | Order book snapshot |
| QuoteRequest | Quote request |
| QuoteResponse / QuoteInfo / SignedOrder | Quote response \+ signed order |
| QuoteReject / RejectReason | Rejection reason |
| Heartbeat | Heartbeat |
| Error / ErrorCode | Error |

---

## 4\. Native Token Handling

### 4.1 Token Address Conventions

**Native Token Representation**

In the DarkPool system, the **zero address** represents Native Token:

| Meaning | Address |
| :---- | :---- |
| Native Token (ETH/BNB, etc.) | 0x0000000000000000000000000000000000000000 |

**Wrapped Native Token Addresses by Chain**

| Chain ID | Chain Name | Native | Wrapped | Wrapped Address |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Ethereum | ETH | WETH | 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 |
| 56 | BSC | BNB | WBNB | 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c |
| 8453 | Base | ETH | WETH | 0x4200000000000000000000000000000000000006 |

### 4.2 MM Order Book Requirements

All order books provided by MM **must use Wrapped Token addresses**.

**Correct Examples**:

- WBNB/USDC (BSC)  
- WETH/USDT (Ethereum)  
- WETH/USDC (Base)

**Incorrect Examples**:

- BNB/USDC (cannot use zero address)  
- ETH/USDT (cannot use zero address)

### 4.3 Request and Response Handling

**SE Request**

In quote requests sent by SE, `token_in` or `token_out` may be zero address:

message QuoteRequest {

  string quote\_id \= 1;

  uint64 chain\_id \= 2;          // 56

  string mm\_id \= 3;

  string token\_in \= 4;          // "0x0000000000000000000000000000000000000000" (zero address \= BNB)

  string token\_out \= 5;         // "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d" (USDC)

  string amount\_in \= 6;         // "1000000000000000000"

  string recipient \= 7;

  string nonce \= 8;

  int64 deadline \= 9;

  uint32 slippage\_bps \= 10;

}

**MM Response**

Return values: `tokenIn`/`tokenOut` should maintain the original values from SE request (may be zero address)

**Processing Flow**

- MM receives request, checks if `token_in` or `token_out` is zero address  
- If zero address, internally convert to the corresponding chain's Wrapped Token address for quote calculation  
- When returning response, keep `tokenIn`/`tokenOut` as original values unchanged

### 4.4 FAQ

**Q1: Must MM handle zero addresses?**

Yes. Requests sent by SE may contain zero addresses, and MM needs to convert them to the corresponding chain's Wrapped Token address for internal processing.

**Q2: Can MM order books be configured with zero addresses?**

No. Order books configured by MM must use Wrapped Token addresses (e.g., WBNB, WETH).

**Q3: What if both tokenIn and tokenOut are zero addresses?**

This situation will not occur. SE will not send requests where both tokens are Native Tokens.

---

## Appendix: Complete Vault Contract Code

// SPDX-License-Identifier: MIT  
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";  
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";  
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/\*//////////////////////////////////////////////////////////////////////////  
                                 INTERFACE  
//////////////////////////////////////////////////////////////////////////\*/  
/// @title MM Vault Interface  
/// @notice Minimal interface used by RFQPool to execute swaps via a market maker vault  
interface IMMVault {  
    /// @notice Perform swap (called by Pool)  
    /// @param from address  
    /// @param to address  
    /// @param inputToken Input token (paid to pool via callback)  
    /// @param outputToken Output token (ERC20 or WETH)  
    /// @param amountIn Input amount (positive)  
    /// @param amountOut Expected minimum amount out  
    /// @param data pool swap params and callback context  
    /// @return actualAmountOut Actual amount out (also emitted via event)  
    function swap(  
        address from,  
        address to,  
        address inputToken,  
        address outputToken,  
        uint256 amountIn,  
        uint256 amountOut,  
        bytes calldata data  
    ) external returns (uint256 actualAmountOut);

    /// @notice VaultSettled event emitted by vault implementations  
    /// @param from Sender address  
    /// @param to Recipient address  
    /// @param inputToken Input token (native as 0x0, wrapped as WETH)  
    /// @param outputToken Output token (native as 0x0, wrapped as WETH)  
    /// @param amountIn Total input for this quote (excluding fee)  
    /// @param actualAmountOut Actual amount received (returned by Pool/Vault)  
    event VaultSettled(  
        address from,  
        address to,  
        address inputToken,  
        address outputToken,  
        uint256 amountIn,  
        uint256 actualAmountOut  
    );  
}

/// @title Interface for WETH9  
interface IWETH9 is IERC20 {  
    event Deposit(address indexed dst, uint256 wad);  
    event Withdrawal(address indexed src, uint256 wad);

    /// @notice Deposit ether to get wrapped ether  
    function deposit() external payable;

    /// @notice Withdraw wrapped ether to get ether  
    function withdraw(uint256) external;

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);  
}

library ErrLib {  
    function ZeroAddress() internal pure returns (string memory) {return "ZERO\_ADDRESS";}

    function UnauthorizedRouter() internal pure returns (string memory) {return "UNAUTHORIZED\_ROUTER";}

    function CallerNotAuthorizedPool() internal pure returns (string memory) {return "CALLER\_NOT\_AUTHORIZED\_POOL";}

    function AmountZero() internal pure returns (string memory) {return "AMOUNT\_ZERO";}

    function TransferETHFailed() internal pure returns (string memory) {return "TRANSFER\_ETH\_FAILED";}

    function NativeTransferFailed() internal pure returns (string memory) {return "NATIVE\_TRANSFER\_FAILED";}

    function PrecheckFail() internal pure returns (string memory) {return "PRECHECK\_FAIL";}  
}

/// @title MMVaultExample  
/// @notice A MM Vault example with preCheck mechanism to verify input deposits before settlement.  
contract MMVaultExample is Ownable, IMMVault {  
    using SafeERC20 for IERC20;

    /\*//////////////////////////////////////////////////////////////////////////  
                                  STATE VARIABLES  
    //////////////////////////////////////////////////////////////////////////\*/

    // RFQManager (internal pool/manager contract)  
    address public manager;  
    address public router;

    IWETH9 public immutable WETH9;

    /\*//////////////////////////////////////////////////////////////////////////  
                                     CONSTRUCTOR  
    //////////////////////////////////////////////////////////////////////////\*/

    constructor(address \_weth9) Ownable(msg.sender) {  
        require(\_weth9 \!= address(0), ErrLib.ZeroAddress());  
        WETH9 \= IWETH9(\_weth9);  
    }

    /\*//////////////////////////////////////////////////////////////////////////  
                                     ADMIN FUNCTIONS  
    //////////////////////////////////////////////////////////////////////////\*/

    function setManager(address \_manager) external onlyOwner {  
        require(\_manager \!= address(0), ErrLib.ZeroAddress());  
        manager \= \_manager;  
    }

    function setRouter(address \_router) external onlyOwner {  
        require(\_router \!= address(0), ErrLib.ZeroAddress());  
        router \= \_router;  
    }

    /// @notice Withdraw stuck ERC20 tokens  
    function withdrawERC20(address token, address to, uint256 amount) external onlyOwner {  
        IERC20(token).safeTransfer(to, amount);  
    }

    /// @notice Withdraw stuck Native ETH (unwraps WETH first)  
    function withdrawNative(address to, uint256 amount) external onlyOwner {  
        WETH9.withdraw(amount);  
        (bool success,) \= to.call{value: amount}("");  
        require(success, ErrLib.NativeTransferFailed());  
    }

    /\*//////////////////////////////////////////////////////////////////////////  
                                    RECEIVE FUNCTION  
    //////////////////////////////////////////////////////////////////////////\*/

    /// @notice Receives Native ETH and automatically wraps it to WETH9  
    receive() external payable {  
        if (msg.value \> 0\) {  
            WETH9.deposit{value: msg.value}();  
        }  
    }

    /\*//////////////////////////////////////////////////////////////////////////  
                                   EXTERNAL FUNCTIONS  
    //////////////////////////////////////////////////////////////////////////\*/

    /// @notice Executes the swap after verifying the balance increased.  
    /// @dev Verifies that (CurrentBalance \>= tokenInBeforeBal \+ amountIn).  
    function swap(  
        address from,  
        address to,  
        address inputToken,  
        address outputToken,  
        uint256 amountIn,  
        uint256 amountOut,  
        bytes calldata /\* data \*/  
    ) external returns (uint256 actualAmountOut) {  
        require(msg.sender \== manager, ErrLib.CallerNotAuthorizedPool());  
        require(amountOut \> 0, ErrLib.AmountZero());

        // 1\. Pull Input from router (router must have approved this vault)  
        \_pullInputFromRouter(inputToken, amountIn);

        // 2\. Execute Output Transfer  
        if (outputToken \== address(0)) {  
             // Unwrap WETH and send Native ETH  
            WETH9.withdraw(amountOut);  
            (bool success, ) \= to.call{value: amountOut}("");  
            require(success, ErrLib.TransferETHFailed());  
        } else {  
            // Transfer ERC20  
            IERC20(outputToken).safeTransfer(to, amountOut);  
        }

        // 3\. Emit Event  
        emit VaultSettled(from, to, inputToken, outputToken, amountIn, amountOut);

        actualAmountOut \= amountOut;  
    }

    /\*//////////////////////////////////////////////////////////////////////////  
                                   INTERNAL FUNCTIONS  
    //////////////////////////////////////////////////////////////////////////\*/

    /// @dev Pull input token from router (payer) into this vault.  
    function \_pullInputFromRouter(address inputToken, uint256 amountIn) internal {  
        address payToken \= inputToken \== address(0) ? address(WETH9) : inputToken;  
        IERC20(payToken).safeTransferFrom(router, address(this), amountIn);  
    }  
}


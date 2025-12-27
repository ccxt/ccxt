<?php

namespace Lighter;

/**
 * Signer - PHP wrapper for the Lighter signing library
 * 
 * This class provides a PHP interface to the lighter-signer shared library,
 * enabling transaction signing for the Lighter decentralized exchange.
 * 
 * Requirements:
 * - PHP 7.4+ with FFI extension enabled
 * - The appropriate shared library for your platform in the build/ directory
 */
class Signer
{
    private \FFI $ffi;
    private static ?Signer $instance = null;

    private const C_DEFINITIONS = <<<'CDEF'
typedef struct {
    char* str;
    char* err;
} StrOrErr;

typedef struct {
    uint8_t txType;
    char* txInfo;
    char* txHash;
    char* messageToSign;
    char* err;
} SignedTxResponse;

typedef struct {
    char* privateKey;
    char* publicKey;
    char* err;
} ApiKeyResponse;

typedef struct {
    uint8_t MarketIndex;
    int64_t ClientOrderIndex;
    int64_t BaseAmount;
    uint32_t Price;
    uint8_t IsAsk;
    uint8_t Type;
    uint8_t TimeInForce;
    uint8_t ReduceOnly;
    uint32_t TriggerPrice;
    int64_t OrderExpiry;
} CreateOrderTxReq;

ApiKeyResponse GenerateAPIKey();
char* CreateClient(char* url, char* privateKey, int chainId, int apiKeyIndex, long long accountIndex);
char* CheckClient(int apiKeyIndex, long long accountIndex);
SignedTxResponse SignChangePubKey(char* pubKey, long long nonce, int apiKeyIndex, long long accountIndex);
SignedTxResponse SignCreateOrder(int marketIndex, long long clientOrderIndex, long long baseAmount, int price, int isAsk, int orderType, int timeInForce, int reduceOnly, int triggerPrice, long long orderExpiry, long long nonce, int apiKeyIndex, long long accountIndex);
SignedTxResponse SignCreateGroupedOrders(uint8_t groupingType, CreateOrderTxReq* orders, int len, long long nonce, int apiKeyIndex, long long accountIndex);
SignedTxResponse SignCancelOrder(int marketIndex, long long orderIndex, long long nonce, int apiKeyIndex, long long accountIndex);
SignedTxResponse SignWithdraw(int assetIndex, int routeType, unsigned long long amount, long long nonce, int apiKeyIndex, long long accountIndex);
SignedTxResponse SignCreateSubAccount(long long nonce, int apiKeyIndex, long long accountIndex);
SignedTxResponse SignCancelAllOrders(int timeInForce, long long time, long long nonce, int apiKeyIndex, long long accountIndex);
SignedTxResponse SignModifyOrder(int marketIndex, long long index, long long baseAmount, long long price, long long triggerPrice, long long nonce, int apiKeyIndex, long long accountIndex);
SignedTxResponse SignTransfer(long long toAccountIndex, int16_t assetIndex, uint8_t fromRouteType, uint8_t toRouteType, long long amount, long long usdcFee, char* memo, long long nonce, int apiKeyIndex, long long accountIndex);
SignedTxResponse SignCreatePublicPool(long long operatorFee, int initialTotalShares, long long minOperatorShareRate, long long nonce, int apiKeyIndex, long long accountIndex);
SignedTxResponse SignUpdatePublicPool(long long publicPoolIndex, int status, long long operatorFee, int minOperatorShareRate, long long nonce, int apiKeyIndex, long long accountIndex);
SignedTxResponse SignMintShares(long long publicPoolIndex, long long shareAmount, long long nonce, int apiKeyIndex, long long accountIndex);
SignedTxResponse SignBurnShares(long long publicPoolIndex, long long shareAmount, long long nonce, int apiKeyIndex, long long accountIndex);
SignedTxResponse SignUpdateLeverage(int marketIndex, int initialMarginFraction, int marginMode, long long nonce, int apiKeyIndex, long long accountIndex);
StrOrErr CreateAuthToken(long long deadline, int apiKeyIndex, long long accountIndex);
SignedTxResponse SignUpdateMargin(int marketIndex, long long usdcAmount, int direction, long long nonce, int apiKeyIndex, long long accountIndex);
CDEF;

    /**
     * Private constructor - use getInstance() instead
     * 
     * @param string|null $libraryPath Optional path to the shared library
     * @throws RuntimeException If the library cannot be loaded
     */
    private function __construct(?string $libraryPath = null)
    {
        $libraryPath = $libraryPath ?? $this->getDefaultLibraryPath();
        
        if (!file_exists($libraryPath)) {
            throw new RuntimeException("Shared library not found at: {$libraryPath}");
        }

        $this->ffi = \FFI::cdef(self::C_DEFINITIONS, $libraryPath);
    }

    /**
     * Get the singleton instance of LighterSigner
     * 
     * @param string|null $libraryPath Optional path to the shared library
     * @return self
     */
    public static function getInstance(?string $libraryPath = null): self
    {
        if (self::$instance === null) {
            self::$instance = new self($libraryPath);
        }
        return self::$instance;
    }

    /**
     * Reset the singleton instance (useful for testing)
     */
    public static function resetInstance(): void
    {
        self::$instance = null;
    }

    /**
     * Determine the default library path based on the current platform
     * 
     * @return string
     * @throws RuntimeException If the platform is not supported
     */
    private function getDefaultLibraryPath(): string
    {
        $os = PHP_OS_FAMILY;
        $arch = php_uname('m');
        
        $baseDir = dirname(__DIR__, 2) . '/build';
        
        if ($os === 'Darwin' && $arch === 'arm64') {
            return $baseDir . '/lighter-signer-darwin-arm64.dylib';
        } elseif ($os === 'Linux' && in_array($arch, ['x86_64', 'amd64'])) {
            return $baseDir . '/lighter-signer-linux-amd64.so';
        } elseif ($os === 'Linux' && $arch === 'aarch64') {
            return $baseDir . '/lighter-signer-linux-arm64.so';
        } elseif ($os === 'Windows' && in_array($arch, ['x86_64', 'AMD64'])) {
            return $baseDir . '/lighter-signer-windows-amd64.dll';
        }
        
        throw new RuntimeException(
            "Unsupported platform/architecture: {$os}/{$arch}. " .
            "Supported: Linux(x86_64, arm64), macOS(arm64), Windows(x86_64)."
        );
    }

    /**
     * Generate a new API key pair
     * 
     * @return array{privateKey: string, publicKey: string}
     * @throws RuntimeException If key generation fails
     */
    public function generateAPIKey(): array
    {
        $result = $this->ffi->GenerateAPIKey();
        
        if ($result->err !== null) {
            throw new RuntimeException("GenerateAPIKey failed: " . \FFI::string($result->err));
        }
        
        return [
            'privateKey' => \FFI::string($result->privateKey),
            'publicKey' => \FFI::string($result->publicKey),
        ];
    }

    /**
     * Create a client for signing transactions
     * 
     * @param string $url The API URL
     * @param string $privateKey The private key for signing
     * @param int $chainId The chain ID
     * @param int $apiKeyIndex The API key index (0-254)
     * @param int $accountIndex The account index
     * @throws RuntimeException If client creation fails
     */
    public function createClient(
        string $url,
        string $privateKey,
        int $chainId,
        int $apiKeyIndex,
        int $accountIndex
    ): void {
        $result = $this->ffi->CreateClient($url, $privateKey, $chainId, $apiKeyIndex, $accountIndex);
        
        if ($result !== null) {
            throw new RuntimeException("CreateClient failed: " . \FFI::string($result));
        }
    }

    /**
     * Check if a client exists and is valid
     * 
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @throws RuntimeException If the client check fails
     */
    public function checkClient(int $apiKeyIndex, int $accountIndex): void
    {
        $result = $this->ffi->CheckClient($apiKeyIndex, $accountIndex);
        
        if ($result !== null) {
            throw new RuntimeException("CheckClient failed: " . \FFI::string($result));
        }
    }

    /**
     * Sign a change public key transaction
     * 
     * @param string $pubKey The new public key (hex encoded)
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signChangePubKey(
        string $pubKey,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $result = $this->ffi->SignChangePubKey($pubKey, $nonce, $apiKeyIndex, $accountIndex);
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Sign a create order transaction
     * 
     * @param int $marketIndex Market index
     * @param int $clientOrderIndex Client-defined order index
     * @param int $baseAmount Base amount
     * @param int $price Price
     * @param int $isAsk 1 for ask (sell), 0 for bid (buy)
     * @param int $orderType Order type
     * @param int $timeInForce Time in force
     * @param int $reduceOnly 1 for reduce only, 0 otherwise
     * @param int $triggerPrice Trigger price for stop/TP orders
     * @param int $orderExpiry Order expiry timestamp (-1 for default 28 days)
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signCreateOrder(
        int $marketIndex,
        int $clientOrderIndex,
        int $baseAmount,
        int $price,
        int $isAsk,
        int $orderType,
        int $timeInForce,
        int $reduceOnly,
        int $triggerPrice,
        int $orderExpiry,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $result = $this->ffi->SignCreateOrder(
            $marketIndex,
            $clientOrderIndex,
            $baseAmount,
            $price,
            $isAsk,
            $orderType,
            $timeInForce,
            $reduceOnly,
            $triggerPrice,
            $orderExpiry,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Sign a grouped orders transaction (OCO, OTO, OTOCO)
     * 
     * @param int $groupingType Grouping type
     * @param array $orders Array of order data
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signCreateGroupedOrders(
        int $groupingType,
        array $orders,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $count = count($orders);
        $ordersArray = $this->ffi->new("CreateOrderTxReq[{$count}]");
        
        foreach ($orders as $i => $order) {
            $ordersArray[$i]->MarketIndex = $order['marketIndex'];
            $ordersArray[$i]->ClientOrderIndex = $order['clientOrderIndex'];
            $ordersArray[$i]->BaseAmount = $order['baseAmount'];
            $ordersArray[$i]->Price = $order['price'];
            $ordersArray[$i]->IsAsk = $order['isAsk'];
            $ordersArray[$i]->Type = $order['type'];
            $ordersArray[$i]->TimeInForce = $order['timeInForce'];
            $ordersArray[$i]->ReduceOnly = $order['reduceOnly'];
            $ordersArray[$i]->TriggerPrice = $order['triggerPrice'];
            $ordersArray[$i]->OrderExpiry = $order['orderExpiry'];
        }
        
        $result = $this->ffi->SignCreateGroupedOrders(
            $groupingType,
            \FFI::addr($ordersArray[0]),
            $count,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Sign a cancel order transaction
     * 
     * @param int $marketIndex Market index
     * @param int $orderIndex Order index to cancel
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signCancelOrder(
        int $marketIndex,
        int $orderIndex,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $result = $this->ffi->SignCancelOrder(
            $marketIndex,
            $orderIndex,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Sign a withdraw transaction
     * 
     * @param int $assetIndex Asset index
     * @param int $routeType Route type (0 = Perps, 1 = Spot)
     * @param int $amount Amount to withdraw
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signWithdraw(
        int $assetIndex,
        int $routeType,
        int $amount,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $result = $this->ffi->SignWithdraw(
            $assetIndex,
            $routeType,
            $amount,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Sign a create sub-account transaction
     * 
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signCreateSubAccount(
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $result = $this->ffi->SignCreateSubAccount($nonce, $apiKeyIndex, $accountIndex);
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Sign a cancel all orders transaction
     * 
     * @param int $timeInForce Time in force
     * @param int $time Time parameter
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signCancelAllOrders(
        int $timeInForce,
        int $time,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $result = $this->ffi->SignCancelAllOrders(
            $timeInForce,
            $time,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Sign a modify order transaction
     * 
     * @param int $marketIndex Market index
     * @param int $index Order index
     * @param int $baseAmount New base amount
     * @param int $price New price
     * @param int $triggerPrice New trigger price
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signModifyOrder(
        int $marketIndex,
        int $index,
        int $baseAmount,
        int $price,
        int $triggerPrice,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $result = $this->ffi->SignModifyOrder(
            $marketIndex,
            $index,
            $baseAmount,
            $price,
            $triggerPrice,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Sign a transfer transaction
     * 
     * @param int $toAccountIndex Destination account index
     * @param int $assetIndex Asset index
     * @param int $fromRouteType Source route type
     * @param int $toRouteType Destination route type
     * @param int $amount Amount to transfer
     * @param int $usdcFee USDC fee
     * @param string $memo Memo (32 bytes or 64/66 hex chars)
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signTransfer(
        int $toAccountIndex,
        int $assetIndex,
        int $fromRouteType,
        int $toRouteType,
        int $amount,
        int $usdcFee,
        string $memo,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $result = $this->ffi->SignTransfer(
            $toAccountIndex,
            $assetIndex,
            $fromRouteType,
            $toRouteType,
            $amount,
            $usdcFee,
            $memo,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Sign a create public pool transaction
     * 
     * @param int $operatorFee Operator fee
     * @param int $initialTotalShares Initial total shares
     * @param int $minOperatorShareRate Minimum operator share rate
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signCreatePublicPool(
        int $operatorFee,
        int $initialTotalShares,
        int $minOperatorShareRate,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $result = $this->ffi->SignCreatePublicPool(
            $operatorFee,
            $initialTotalShares,
            $minOperatorShareRate,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Sign an update public pool transaction
     * 
     * @param int $publicPoolIndex Public pool index
     * @param int $status Pool status
     * @param int $operatorFee Operator fee
     * @param int $minOperatorShareRate Minimum operator share rate
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signUpdatePublicPool(
        int $publicPoolIndex,
        int $status,
        int $operatorFee,
        int $minOperatorShareRate,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $result = $this->ffi->SignUpdatePublicPool(
            $publicPoolIndex,
            $status,
            $operatorFee,
            $minOperatorShareRate,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Sign a mint shares transaction
     * 
     * @param int $publicPoolIndex Public pool index
     * @param int $shareAmount Share amount to mint
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signMintShares(
        int $publicPoolIndex,
        int $shareAmount,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $result = $this->ffi->SignMintShares(
            $publicPoolIndex,
            $shareAmount,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Sign a burn shares transaction
     * 
     * @param int $publicPoolIndex Public pool index
     * @param int $shareAmount Share amount to burn
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signBurnShares(
        int $publicPoolIndex,
        int $shareAmount,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $result = $this->ffi->SignBurnShares(
            $publicPoolIndex,
            $shareAmount,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Sign an update leverage transaction
     * 
     * @param int $marketIndex Market index
     * @param int $initialMarginFraction Initial margin fraction
     * @param int $marginMode Margin mode (0 = Cross, 1 = Isolated)
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signUpdateLeverage(
        int $marketIndex,
        int $initialMarginFraction,
        int $marginMode,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $result = $this->ffi->SignUpdateLeverage(
            $marketIndex,
            $initialMarginFraction,
            $marginMode,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Create an authentication token
     * 
     * @param int $deadline Token deadline timestamp (0 for default 7 hours)
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return string The authentication token
     * @throws RuntimeException If token creation fails
     */
    public function createAuthToken(
        int $deadline,
        int $apiKeyIndex,
        int $accountIndex
    ): string {
        $result = $this->ffi->CreateAuthToken($deadline, $apiKeyIndex, $accountIndex);
        
        if ($result->err !== null) {
            throw new RuntimeException("CreateAuthToken failed: " . \FFI::string($result->err));
        }
        
        return \FFI::string($result->str);
    }

    /**
     * Sign an update margin transaction
     * 
     * @param int $marketIndex Market index
     * @param int $usdcAmount USDC amount
     * @param int $direction Direction (0 = Remove, 1 = Add)
     * @param int $nonce Transaction nonce
     * @param int $apiKeyIndex The API key index
     * @param int $accountIndex The account index
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If signing fails
     */
    public function signUpdateMargin(
        int $marketIndex,
        int $usdcAmount,
        int $direction,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $result = $this->ffi->SignUpdateMargin(
            $marketIndex,
            $usdcAmount,
            $direction,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );
        return $this->parseSignedTxResponse($result);
    }

    /**
     * Parse a SignedTxResponse from FFI into a PHP array
     * 
     * @param \FFI\CData $result The FFI result
     * @return array{txType: int, txInfo: string, txHash: string, messageToSign: string|null}
     * @throws RuntimeException If the response contains an error
     */
    private function parseSignedTxResponse(\FFI\CData $result): array
    {
        if ($result->err !== null) {
            throw new RuntimeException("Signing failed: " . \FFI::string($result->err));
        }
        
        return [
            'txType' => $result->txType,
            'txInfo' => \FFI::string($result->txInfo),
            'txHash' => \FFI::string($result->txHash),
            'messageToSign' => $result->messageToSign !== null 
                ? \FFI::string($result->messageToSign) 
                : null,
        ];
    }
}
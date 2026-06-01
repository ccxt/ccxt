<?php

namespace Lighter;
use \RuntimeException;

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
            int16_t MarketIndex;
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

        ApiKeyResponse GenerateAPIKey(void);
        char* CreateClient(char* cUrl, char* cPrivateKey, int cChainId, int cApiKeyIndex, long long cAccountIndex);
        char* CheckClient(int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignChangePubKey(char* cPubKey, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignCreateOrder(int cMarketIndex, long long cClientOrderIndex, long long cBaseAmount, int cPrice, int cIsAsk, int cOrderType, int cTimeInForce, int cReduceOnly, int cTriggerPrice, long long cOrderExpiry, long long cIntegratorAccountIndex, int cIntegratorTakerFee, int cIntegratorMakerFee, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignCreateGroupedOrders(uint8_t cGroupingType, CreateOrderTxReq* cOrders, int cLen, long long cIntegratorAccountIndex, int cIntegratorTakerFee, int cIntegratorMakerFee, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignCancelOrder(int cMarketIndex, long long cOrderIndex, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignWithdraw(int cAssetIndex, int cRouteType, unsigned long long cAmount, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignCreateSubAccount(uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignCancelAllOrders(int cTimeInForce, long long cTime, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignModifyOrder(int cMarketIndex, long long cIndex, long long cBaseAmount, long long cPrice, long long cTriggerPrice, long long cIntegratorAccountIndex, int cIntegratorTakerFee, int cIntegratorMakerFee, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignTransfer(long long cToAccountIndex, int16_t cAssetIndex, uint8_t cFromRouteType, uint8_t cToRouteType, long long cAmount, long long cUsdcFee, char* cMemo, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignCreatePublicPool(long long cOperatorFee, int cInitialTotalShares, long long cMinOperatorShareRate, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignUpdatePublicPool(long long cPublicPoolIndex, int cStatus, long long cOperatorFee, int cMinOperatorShareRate, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignMintShares(long long cPublicPoolIndex, long long cShareAmount, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignBurnShares(long long cPublicPoolIndex, long long cShareAmount, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignUpdateLeverage(int cMarketIndex, int cInitialMarginFraction, int cMarginMode, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        StrOrErr CreateAuthToken(long long cDeadline, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignUpdateMargin(int cMarketIndex, long long cUSDCAmount, int cDirection, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignStakeAssets(long long cStakingPoolIndex, long long cShareAmount, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignUnstakeAssets(long long cStakingPoolIndex, long long cShareAmount, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        SignedTxResponse SignApproveIntegrator(long long cIntegratorIndex, uint32_t cMaxPerpsTakerFee, uint32_t cMaxPerpsMakerFee, uint32_t cMaxSpotTakerFee, uint32_t cMaxSpotMakerFee, long long cApprovalExpiry, uint8_t cSkipNonce, long long cNonce, int cApiKeyIndex, long long cAccountIndex);
        void Free(void* ptr);
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

    private function cStr(?\FFI\CData $ptr): ?string
    {
        if ($ptr === null) {
            return null;
        }

        $addr = $this->ffi->cast('uintptr_t', $ptr);
        if ($addr->cdata === 0) {
            return null;
        }

        return \FFI::string($ptr);
    }

    private function freeIfNotNull(?\FFI\CData $ptr): void
    {
        if ($ptr === null) {
            return;
        }

        $addr = $this->ffi->cast('uintptr_t', $ptr);
        if ($addr->cdata !== 0) {
            $this->ffi->Free($this->ffi->cast('void*', $ptr));
        }
    }

    private function normalizeSignedTxResponse(\FFI\CData $res): array
    {
        $out = [
            'txType' => (int)$res->txType,
            'txInfo' => $this->cStr($res->txInfo),
            'txHash' => $this->cStr($res->txHash),
            'messageToSign' => $this->cStr($res->messageToSign),
            'err' => $this->cStr($res->err),
        ];

        // Assumes returned char* fields are heap-allocated by Go and should be freed via Free().
        $this->freeIfNotNull($res->txInfo);
        $this->freeIfNotNull($res->txHash);
        $this->freeIfNotNull($res->messageToSign);
        $this->freeIfNotNull($res->err);

        return $out;
    }

    private function normalizeStrOrErr(\FFI\CData $res): array
    {
        $out = [
            'str' => $this->cStr($res->str),
            'err' => $this->cStr($res->err),
        ];

        $this->freeIfNotNull($res->str);
        $this->freeIfNotNull($res->err);

        return $out;
    }

    private function normalizeApiKeyResponse(\FFI\CData $res): array
    {
        $out = [
            'privateKey' => $this->cStr($res->privateKey),
            'publicKey' => $this->cStr($res->publicKey),
            'err' => $this->cStr($res->err),
        ];

        $this->freeIfNotNull($res->privateKey);
        $this->freeIfNotNull($res->publicKey);
        $this->freeIfNotNull($res->err);

        return $out;
    }

    public function generateAPIKey(): array
    {
        $res = $this->ffi->GenerateAPIKey();
        return $this->normalizeApiKeyResponse($res);
    }

    public function createClient(
        string $url,
        string $privateKey,
        int $chainId,
        int $apiKeyIndex,
        int $accountIndex
    ): ?string {
        $ptr = $this->ffi->CreateClient(
            $url,
            $privateKey,
            $chainId,
            $apiKeyIndex,
            $accountIndex
        );

        $out = $this->cStr($ptr);
        $this->freeIfNotNull($ptr);

        return $out;
    }

    public function checkClient(int $apiKeyIndex, int $accountIndex): ?string
    {
        $ptr = $this->ffi->CheckClient($apiKeyIndex, $accountIndex);

        $out = $this->cStr($ptr);
        $this->freeIfNotNull($ptr);

        return $out;
    }

    public function signChangePubKey(
        string $pubKey,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignChangePubKey(
            $pubKey,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function createAuthToken(
        int $deadline,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->CreateAuthToken($deadline, $apiKeyIndex, $accountIndex);
        return $this->normalizeStrOrErr($res);
    }

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
        int $integratorAccountIndex,
        int $integratorTakerFee,
        int $integratorMakerFee,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignCreateOrder(
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
            $integratorAccountIndex,
            $integratorTakerFee,
            $integratorMakerFee,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signCreateGroupedOrders(
        int $groupingType,
        array $orders,
        int $integratorAccountIndex,
        int $integratorTakerFee,
        int $integratorMakerFee,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $len = count($orders);
        if ($len === 0) {
            throw new \InvalidArgumentException('orders must not be empty');
        }

        $cOrders = \FFI::new("CreateOrderTxReq[$len]", false);

        foreach ($orders as $i => $order) {
            $cOrders[$i]->MarketIndex      = (int)$order['MarketIndex'];
            $cOrders[$i]->ClientOrderIndex = (int)$order['ClientOrderIndex'];
            $cOrders[$i]->BaseAmount       = (int)$order['BaseAmount'];
            $cOrders[$i]->Price            = (int)$order['Price'];
            $cOrders[$i]->IsAsk            = (int)$order['IsAsk'];
            $cOrders[$i]->Type             = (int)$order['Type'];
            $cOrders[$i]->TimeInForce      = (int)$order['TimeInForce'];
            $cOrders[$i]->ReduceOnly       = (int)$order['ReduceOnly'];
            $cOrders[$i]->TriggerPrice     = (int)$order['TriggerPrice'];
            $cOrders[$i]->OrderExpiry      = (int)$order['OrderExpiry'];
        }

        $res = $this->ffi->SignCreateGroupedOrders(
            $groupingType,
            \FFI::addr($cOrders[0]),
            $len,
            $integratorAccountIndex,
            $integratorTakerFee,
            $integratorMakerFee,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signCancelOrder(
        int $marketIndex,
        int $orderIndex,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignCancelOrder(
            $marketIndex,
            $orderIndex,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signWithdraw(
        int $assetIndex,
        int $routeType,
        int $amount,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignWithdraw(
            $assetIndex,
            $routeType,
            $amount,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signCreateSubAccount(
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignCreateSubAccount(
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signCancelAllOrders(
        int $timeInForce,
        int $time,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignCancelAllOrders(
            $timeInForce,
            $time,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signModifyOrder(
        int $marketIndex,
        int $index,
        int $baseAmount,
        int $price,
        int $triggerPrice,
        int $integratorAccountIndex,
        int $integratorTakerFee,
        int $integratorMakerFee,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignModifyOrder(
            $marketIndex,
            $index,
            $baseAmount,
            $price,
            $triggerPrice,
            $integratorAccountIndex,
            $integratorTakerFee,
            $integratorMakerFee,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signCreatePublicPool(
        int $operatorFee,
        int $initialTotalShares,
        int $minOperatorShareRate,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignCreatePublicPool(
            $operatorFee,
            $initialTotalShares,
            $minOperatorShareRate,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signUpdatePublicPool(
        int $publicPoolIndex,
        int $status,
        int $operatorFee,
        int $minOperatorShareRate,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignUpdatePublicPool(
            $publicPoolIndex,
            $status,
            $operatorFee,
            $minOperatorShareRate,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signMintShares(
        int $publicPoolIndex,
        int $shareAmount,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignMintShares(
            $publicPoolIndex,
            $shareAmount,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signBurnShares(
        int $publicPoolIndex,
        int $shareAmount,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignBurnShares(
            $publicPoolIndex,
            $shareAmount,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signUpdateLeverage(
        int $marketIndex,
        int $initialMarginFraction,
        int $marginMode,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignUpdateLeverage(
            $marketIndex,
            $initialMarginFraction,
            $marginMode,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signUpdateMargin(
        int $marketIndex,
        int $usdcAmount,
        int $direction,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignUpdateMargin(
            $marketIndex,
            $usdcAmount,
            $direction,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signStakeAssets(
        int $stakingPoolIndex,
        int $shareAmount,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignStakeAssets(
            $stakingPoolIndex,
            $shareAmount,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signUnstakeAssets(
        int $stakingPoolIndex,
        int $shareAmount,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignUnstakeAssets(
            $stakingPoolIndex,
            $shareAmount,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signTransfer(
        int $toAccountIndex,
        int $assetIndex,
        int $fromRouteType,
        int $toRouteType,
        int $amount,
        int $usdcFee,
        string $memo,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignTransfer(
            $toAccountIndex,
            $assetIndex,
            $fromRouteType,
            $toRouteType,
            $amount,
            $usdcFee,
            $memo,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }

    public function signApproveIntegrator(
        int $integratorIndex,
        int $maxPerpsTakerFee,
        int $maxPerpsMakerFee,
        int $maxSpotTakerFee,
        int $maxSpotMakerFee,
        int $approvalExpiry,
        int $skipNonce,
        int $nonce,
        int $apiKeyIndex,
        int $accountIndex
    ): array {
        $res = $this->ffi->SignApproveIntegrator(
            $integratorIndex,
            $maxPerpsTakerFee,
            $maxPerpsMakerFee,
            $maxSpotTakerFee,
            $maxSpotMakerFee,
            $approvalExpiry,
            $skipNonce,
            $nonce,
            $apiKeyIndex,
            $accountIndex
        );

        return $this->normalizeSignedTxResponse($res);
    }
}
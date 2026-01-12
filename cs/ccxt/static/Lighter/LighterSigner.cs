#nullable enable
using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace Lighter
{
    /// <summary>
    /// LighterSigner - C# wrapper for the Lighter signing native library (Go c-shared).
    /// netstandard2.0/2.1 compatible (no NativeLibrary resolver, no records).
    /// </summary>
    public sealed class LighterSigner : IDisposable
    {
        private static LighterSigner? _instance;

        private readonly NativeLib _lib;
        private bool _disposed;

        /// <summary>Get singleton instance (like PHP getInstance()).</summary>
        public static LighterSigner GetInstance(string? libraryPath = null)
        {
            if (_instance == null)
                _instance = new LighterSigner(libraryPath);

            return _instance;
        }

        /// <summary>Reset singleton instance (useful for testing).</summary>
        public static void ResetInstance()
        {
            _instance?.Dispose();
            _instance = null;
        }

        private LighterSigner(string? libraryPath)
        {
            var path = libraryPath ?? GetDefaultLibraryPath();
            if (!File.Exists(path))
                throw new FileNotFoundException($"Shared library not found at: {path}");

            _lib = new NativeLib(path);

            // bind exports (names must match exactly what the native lib exports)
            _generateApiKey = _lib.GetFunction<GenerateAPIKeyDelegate>("GenerateAPIKey");
            _createClient = _lib.GetFunction<CreateClientDelegate>("CreateClient");
            _checkClient = _lib.GetFunction<CheckClientDelegate>("CheckClient");

            _signChangePubKey = _lib.GetFunction<SignChangePubKeyDelegate>("SignChangePubKey");
            _signCreateOrder = _lib.GetFunction<SignCreateOrderDelegate>("SignCreateOrder");
            _signCreateGroupedOrders = _lib.GetFunction<SignCreateGroupedOrdersDelegate>("SignCreateGroupedOrders");
            _signCancelOrder = _lib.GetFunction<SignCancelOrderDelegate>("SignCancelOrder");
            _signWithdraw = _lib.GetFunction<SignWithdrawDelegate>("SignWithdraw");
            _signCreateSubAccount = _lib.GetFunction<SignCreateSubAccountDelegate>("SignCreateSubAccount");
            _signCancelAllOrders = _lib.GetFunction<SignCancelAllOrdersDelegate>("SignCancelAllOrders");
            _signModifyOrder = _lib.GetFunction<SignModifyOrderDelegate>("SignModifyOrder");
            _signTransfer = _lib.GetFunction<SignTransferDelegate>("SignTransfer");
            _signCreatePublicPool = _lib.GetFunction<SignCreatePublicPoolDelegate>("SignCreatePublicPool");
            _signUpdatePublicPool = _lib.GetFunction<SignUpdatePublicPoolDelegate>("SignUpdatePublicPool");
            _signMintShares = _lib.GetFunction<SignMintSharesDelegate>("SignMintShares");
            _signBurnShares = _lib.GetFunction<SignBurnSharesDelegate>("SignBurnShares");
            _signUpdateLeverage = _lib.GetFunction<SignUpdateLeverageDelegate>("SignUpdateLeverage");
            _createAuthToken = _lib.GetFunction<CreateAuthTokenDelegate>("CreateAuthToken");
            _signUpdateMargin = _lib.GetFunction<SignUpdateMarginDelegate>("SignUpdateMargin");
        }

        public void Dispose()
        {
            if (_disposed) return;
            _disposed = true;
            _lib.Dispose();
        }

        // -----------------------------
        // Public DTOs
        // -----------------------------

        public sealed class SignedTx
        {
            public byte TxType { get; }
            public string TxInfo { get; }
            public string TxHash { get; }
            public string? MessageToSign { get; }

            public SignedTx(byte txType, string txInfo, string txHash, string? messageToSign)
            {
                TxType = txType;
                TxInfo = txInfo;
                TxHash = txHash;
                MessageToSign = messageToSign;
            }
        }

        [StructLayout(LayoutKind.Sequential)]
        public struct CreateOrderTxReq
        {
            public byte MarketIndex;
            public long ClientOrderIndex;
            public long BaseAmount;
            public uint Price;
            public byte IsAsk;
            public byte Type;
            public byte TimeInForce;
            public byte ReduceOnly;
            public uint TriggerPrice;
            public long OrderExpiry;
        }

        // -----------------------------
        // Native structs (match C ABI)
        // -----------------------------

        [StructLayout(LayoutKind.Sequential)]
        private struct StrOrErr
        {
            public IntPtr str;
            public IntPtr err;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct SignedTxResponse
        {
            public byte txType;
            public IntPtr txInfo;
            public IntPtr txHash;
            public IntPtr messageToSign;
            public IntPtr err;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct ApiKeyResponse
        {
            public IntPtr privateKey;
            public IntPtr publicKey;
            public IntPtr err;
        }

        // -----------------------------
        // Delegates for exports (cdecl)
        // -----------------------------

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate ApiKeyResponse GenerateAPIKeyDelegate();

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate IntPtr CreateClientDelegate(IntPtr url, IntPtr privateKey, int chainId, int apiKeyIndex, long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate IntPtr CheckClientDelegate(int apiKeyIndex, long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignChangePubKeyDelegate(IntPtr pubKey, long nonce, int apiKeyIndex, long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignCreateOrderDelegate(
            int marketIndex,
            long clientOrderIndex,
            long baseAmount,
            int price,
            int isAsk,
            int orderType,
            int timeInForce,
            int reduceOnly,
            int triggerPrice,
            long orderExpiry,
            long nonce,
            int apiKeyIndex,
            long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignCreateGroupedOrdersDelegate(
            byte groupingType,
            IntPtr orders,
            int len,
            long nonce,
            int apiKeyIndex,
            long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignCancelOrderDelegate(int marketIndex, long orderIndex, long nonce, int apiKeyIndex, long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignWithdrawDelegate(int assetIndex, int routeType, ulong amount, long nonce, int apiKeyIndex, long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignCreateSubAccountDelegate(long nonce, int apiKeyIndex, long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignCancelAllOrdersDelegate(int timeInForce, long time, long nonce, int apiKeyIndex, long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignModifyOrderDelegate(int marketIndex, long index, long baseAmount, long price, long triggerPrice, long nonce, int apiKeyIndex, long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignTransferDelegate(
            long toAccountIndex,
            short assetIndex,
            byte fromRouteType,
            byte toRouteType,
            long amount,
            long usdcFee,
            IntPtr memo,
            long nonce,
            int apiKeyIndex,
            long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignCreatePublicPoolDelegate(long operatorFee, int initialTotalShares, long minOperatorShareRate, long nonce, int apiKeyIndex, long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignUpdatePublicPoolDelegate(long publicPoolIndex, int status, long operatorFee, int minOperatorShareRate, long nonce, int apiKeyIndex, long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignMintSharesDelegate(long publicPoolIndex, long shareAmount, long nonce, int apiKeyIndex, long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignBurnSharesDelegate(long publicPoolIndex, long shareAmount, long nonce, int apiKeyIndex, long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignUpdateLeverageDelegate(int marketIndex, int initialMarginFraction, int marginMode, long nonce, int apiKeyIndex, long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate StrOrErr CreateAuthTokenDelegate(long deadline, int apiKeyIndex, long accountIndex);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        private delegate SignedTxResponse SignUpdateMarginDelegate(int marketIndex, long usdcAmount, int direction, long nonce, int apiKeyIndex, long accountIndex);

        // bound delegates
        private readonly GenerateAPIKeyDelegate _generateApiKey;
        private readonly CreateClientDelegate _createClient;
        private readonly CheckClientDelegate _checkClient;
        private readonly SignChangePubKeyDelegate _signChangePubKey;
        private readonly SignCreateOrderDelegate _signCreateOrder;
        private readonly SignCreateGroupedOrdersDelegate _signCreateGroupedOrders;
        private readonly SignCancelOrderDelegate _signCancelOrder;
        private readonly SignWithdrawDelegate _signWithdraw;
        private readonly SignCreateSubAccountDelegate _signCreateSubAccount;
        private readonly SignCancelAllOrdersDelegate _signCancelAllOrders;
        private readonly SignModifyOrderDelegate _signModifyOrder;
        private readonly SignTransferDelegate _signTransfer;
        private readonly SignCreatePublicPoolDelegate _signCreatePublicPool;
        private readonly SignUpdatePublicPoolDelegate _signUpdatePublicPool;
        private readonly SignMintSharesDelegate _signMintShares;
        private readonly SignBurnSharesDelegate _signBurnShares;
        private readonly SignUpdateLeverageDelegate _signUpdateLeverage;
        private readonly CreateAuthTokenDelegate _createAuthToken;
        private readonly SignUpdateMarginDelegate _signUpdateMargin;

        // -----------------------------
        // Public API (mirrors PHP)
        // -----------------------------

        public (string PrivateKey, string PublicKey) GenerateAPIKey()
        {
            EnsureNotDisposed();

            var result = _generateApiKey();
            var err = PtrToUtf8StringOrNull(result.err);
            if (err != null) throw new InvalidOperationException($"GenerateAPIKey failed: {err}");

            return (PtrToUtf8StringOrEmpty(result.privateKey), PtrToUtf8StringOrEmpty(result.publicKey));
        }

        public void CreateClient(string url, string privateKey, int chainId, int apiKeyIndex, long accountIndex)
        {
            EnsureNotDisposed();

            using (var u = Utf8Scope.From(url))
            using (var pk = Utf8Scope.From(privateKey))
            {
                var errPtr = _createClient(u.Ptr, pk.Ptr, chainId, apiKeyIndex, accountIndex);
                if (errPtr != IntPtr.Zero)
                    throw new InvalidOperationException("CreateClient failed: " + PtrToUtf8StringOrEmpty(errPtr));
            }
        }

        public void CheckClient(int apiKeyIndex, long accountIndex)
        {
            EnsureNotDisposed();

            var errPtr = _checkClient(apiKeyIndex, accountIndex);
            if (errPtr != IntPtr.Zero)
                throw new InvalidOperationException("CheckClient failed: " + PtrToUtf8StringOrEmpty(errPtr));
        }

        public SignedTx SignChangePubKey(string pubKey, long nonce, int apiKeyIndex, long accountIndex)
        {
            EnsureNotDisposed();

            using (var pk = Utf8Scope.From(pubKey))
            {
                var r = _signChangePubKey(pk.Ptr, nonce, apiKeyIndex, accountIndex);
                return ParseSignedTx(r);
            }
        }

        public SignedTx SignCreateOrder(
            int marketIndex,
            long clientOrderIndex,
            long baseAmount,
            int price,
            int isAsk,
            int orderType,
            int timeInForce,
            int reduceOnly,
            int triggerPrice,
            long orderExpiry,
            long nonce,
            int apiKeyIndex,
            long accountIndex)
        {
            EnsureNotDisposed();

            var r = _signCreateOrder(
                marketIndex, clientOrderIndex, baseAmount, price, isAsk, orderType, timeInForce,
                reduceOnly, triggerPrice, orderExpiry, nonce, apiKeyIndex, accountIndex);

            return ParseSignedTx(r);
        }

        public SignedTx SignCreateGroupedOrders(
            byte groupingType,
            IReadOnlyList<CreateOrderTxReq> orders,
            long nonce,
            int apiKeyIndex,
            long accountIndex)
        {
            EnsureNotDisposed();

            if (orders == null) throw new ArgumentNullException(nameof(orders));
            if (orders.Count == 0) throw new ArgumentException("orders cannot be empty", nameof(orders));

            var arr = new CreateOrderTxReq[orders.Count];
            for (int i = 0; i < orders.Count; i++) arr[i] = orders[i];

            var handle = GCHandle.Alloc(arr, GCHandleType.Pinned);
            try
            {
                var ptr = handle.AddrOfPinnedObject();
                var r = _signCreateGroupedOrders(groupingType, ptr, arr.Length, nonce, apiKeyIndex, accountIndex);
                return ParseSignedTx(r);
            }
            finally
            {
                handle.Free();
            }
        }

        public SignedTx SignCancelOrder(int marketIndex, long orderIndex, long nonce, int apiKeyIndex, long accountIndex)
            => ParseSignedTx(_signCancelOrder(marketIndex, orderIndex, nonce, apiKeyIndex, accountIndex));

        public SignedTx SignWithdraw(int assetIndex, int routeType, ulong amount, long nonce, int apiKeyIndex, long accountIndex)
            => ParseSignedTx(_signWithdraw(assetIndex, routeType, amount, nonce, apiKeyIndex, accountIndex));

        public SignedTx SignCreateSubAccount(long nonce, int apiKeyIndex, long accountIndex)
            => ParseSignedTx(_signCreateSubAccount(nonce, apiKeyIndex, accountIndex));

        public SignedTx SignCancelAllOrders(int timeInForce, long time, long nonce, int apiKeyIndex, long accountIndex)
            => ParseSignedTx(_signCancelAllOrders(timeInForce, time, nonce, apiKeyIndex, accountIndex));

        public SignedTx SignModifyOrder(int marketIndex, long index, long baseAmount, long price, long triggerPrice, long nonce, int apiKeyIndex, long accountIndex)
            => ParseSignedTx(_signModifyOrder(marketIndex, index, baseAmount, price, triggerPrice, nonce, apiKeyIndex, accountIndex));

        public SignedTx SignTransfer(long toAccountIndex, short assetIndex, byte fromRouteType, byte toRouteType, long amount, long usdcFee, string memo, long nonce, int apiKeyIndex, long accountIndex)
        {
            EnsureNotDisposed();

            using (var m = Utf8Scope.From(memo))
            {
                var r = _signTransfer(toAccountIndex, assetIndex, fromRouteType, toRouteType, amount, usdcFee, m.Ptr, nonce, apiKeyIndex, accountIndex);
                return ParseSignedTx(r);
            }
        }

        public SignedTx SignCreatePublicPool(long operatorFee, int initialTotalShares, long minOperatorShareRate, long nonce, int apiKeyIndex, long accountIndex)
            => ParseSignedTx(_signCreatePublicPool(operatorFee, initialTotalShares, minOperatorShareRate, nonce, apiKeyIndex, accountIndex));

        public SignedTx SignUpdatePublicPool(long publicPoolIndex, int status, long operatorFee, int minOperatorShareRate, long nonce, int apiKeyIndex, long accountIndex)
            => ParseSignedTx(_signUpdatePublicPool(publicPoolIndex, status, operatorFee, minOperatorShareRate, nonce, apiKeyIndex, accountIndex));

        public SignedTx SignMintShares(long publicPoolIndex, long shareAmount, long nonce, int apiKeyIndex, long accountIndex)
            => ParseSignedTx(_signMintShares(publicPoolIndex, shareAmount, nonce, apiKeyIndex, accountIndex));

        public SignedTx SignBurnShares(long publicPoolIndex, long shareAmount, long nonce, int apiKeyIndex, long accountIndex)
            => ParseSignedTx(_signBurnShares(publicPoolIndex, shareAmount, nonce, apiKeyIndex, accountIndex));

        public SignedTx SignUpdateLeverage(int marketIndex, int initialMarginFraction, int marginMode, long nonce, int apiKeyIndex, long accountIndex)
            => ParseSignedTx(_signUpdateLeverage(marketIndex, initialMarginFraction, marginMode, nonce, apiKeyIndex, accountIndex));

        public string CreateAuthToken(long deadline, int apiKeyIndex, long accountIndex)
        {
            EnsureNotDisposed();

            var r = _createAuthToken(deadline, apiKeyIndex, accountIndex);

            var err = PtrToUtf8StringOrNull(r.err);
            if (err != null) throw new InvalidOperationException($"CreateAuthToken failed: {err}");

            return PtrToUtf8StringOrEmpty(r.str);
        }

        public SignedTx SignUpdateMargin(int marketIndex, long usdcAmount, int direction, long nonce, int apiKeyIndex, long accountIndex)
            => ParseSignedTx(_signUpdateMargin(marketIndex, usdcAmount, direction, nonce, apiKeyIndex, accountIndex));

        // -----------------------------
        // Helpers
        // -----------------------------

        private void EnsureNotDisposed()
        {
            if (_disposed) throw new ObjectDisposedException(nameof(LighterSigner));
        }

        private static SignedTx ParseSignedTx(SignedTxResponse r)
        {
            var err = PtrToUtf8StringOrNull(r.err);
            if (err != null) throw new InvalidOperationException($"Signing failed: {err}");

            return new SignedTx(
                r.txType,
                PtrToUtf8StringOrEmpty(r.txInfo),
                PtrToUtf8StringOrEmpty(r.txHash),
                PtrToUtf8StringOrNull(r.messageToSign)
            );
        }

        private static string PtrToUtf8StringOrEmpty(IntPtr p) => PtrToUtf8StringOrNull(p) ?? "";
        private static string? PtrToUtf8StringOrNull(IntPtr p)
        {
            if (p == IntPtr.Zero) return null;

            // Read until null terminator
            int len = 0;
            while (Marshal.ReadByte(p, len) != 0) len++;

            var bytes = new byte[len];
            Marshal.Copy(p, bytes, 0, len);
            return Encoding.UTF8.GetString(bytes);
        }

        private static string GetDefaultLibraryPath()
        {
            var baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "build"));

            if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX) &&
                RuntimeInformation.OSArchitecture == Architecture.Arm64)
                return Path.Combine(baseDir, "lighter-signer-darwin-arm64.dylib");

            if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux) &&
                RuntimeInformation.OSArchitecture == Architecture.X64)
                return Path.Combine(baseDir, "lighter-signer-linux-amd64.so");

            if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux) &&
                RuntimeInformation.OSArchitecture == Architecture.Arm64)
                return Path.Combine(baseDir, "lighter-signer-linux-arm64.so");

            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows) &&
                RuntimeInformation.OSArchitecture == Architecture.X64)
                return Path.Combine(baseDir, "lighter-signer-windows-amd64.dll");

            throw new PlatformNotSupportedException(
                $"Unsupported platform/architecture: {RuntimeInformation.OSDescription}/{RuntimeInformation.OSArchitecture}. " +
                "Supported: Linux(x64, arm64), macOS(arm64), Windows(x64).");
        }

        /// <summary>
        /// Allocates a null-terminated UTF-8 string in unmanaged memory for passing to native code.
        /// </summary>
        private readonly struct Utf8Scope : IDisposable
        {
            public IntPtr Ptr { get; }

            private Utf8Scope(IntPtr ptr) => Ptr = ptr;

            public static Utf8Scope From(string s)
            {
                if (s == null) throw new ArgumentNullException(nameof(s));
                var bytes = Encoding.UTF8.GetBytes(s);
                var mem = Marshal.AllocHGlobal(bytes.Length + 1);
                Marshal.Copy(bytes, 0, mem, bytes.Length);
                Marshal.WriteByte(mem, bytes.Length, 0);
                return new Utf8Scope(mem);
            }

            public void Dispose()
            {
                if (Ptr != IntPtr.Zero) Marshal.FreeHGlobal(Ptr);
            }
        }

        // -----------------------------
        // Native library loader (netstandard2.x friendly)
        // -----------------------------
        private sealed class NativeLib : IDisposable
        {
            private IntPtr _handle;

            public NativeLib(string path)
            {
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    _handle = WinLoadLibrary(path);
                    if (_handle == IntPtr.Zero)
                        throw new DllNotFoundException($"LoadLibrary failed for {path}");
                }
                else
                {
                    _handle = UnixDlopen(path, RTLD_NOW);
                    if (_handle == IntPtr.Zero)
                        throw new DllNotFoundException($"dlopen failed for {path}");
                }
            }

            public T GetFunction<T>(string name) where T : class
            {
                IntPtr sym = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                    ? WinGetProcAddress(_handle, name)
                    : UnixDlsym(_handle, name);

                if (sym == IntPtr.Zero)
                    throw new EntryPointNotFoundException($"Function '{name}' not found in native library.");

                return Marshal.GetDelegateForFunctionPointer(sym, typeof(T)) as T
                       ?? throw new InvalidOperationException($"Failed to create delegate for '{name}'.");
            }

            public void Dispose()
            {
                if (_handle == IntPtr.Zero) return;

                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                    WinFreeLibrary(_handle);
                else
                    UnixDlclose(_handle);

                _handle = IntPtr.Zero;
            }

            private const int RTLD_NOW = 2;

            // Windows
            [DllImport("kernel32", SetLastError = true, CharSet = CharSet.Unicode)]
            private static extern IntPtr LoadLibraryW(string lpFileName);

            [DllImport("kernel32", SetLastError = true)]
            private static extern IntPtr GetProcAddress(IntPtr hModule, string procName);

            [DllImport("kernel32", SetLastError = true)]
            private static extern bool FreeLibrary(IntPtr hModule);

            private static IntPtr WinLoadLibrary(string path) => LoadLibraryW(path);
            private static IntPtr WinGetProcAddress(IntPtr h, string name) => GetProcAddress(h, name);
            private static void WinFreeLibrary(IntPtr h) => FreeLibrary(h);

            // Unix (Linux/macOS) - dlopen/dlsym/dlclose
            // Linux: libdl.so.2; macOS: libSystem.B.dylib provides dlopen symbols
            // private static string UnixLib =>
            //     RuntimeInformation.IsOSPlatform(OSPlatform.OSX) ? "libSystem.B.dylib" : "libdl.so.2";
            // Unix (Linux/macOS) - dlopen/dlsym/dlclose

            // macOS: dlopen/dlsym/dlclose are in libSystem.B.dylib
            [DllImport("libSystem.B.dylib", EntryPoint = "dlopen")]
            private static extern IntPtr dlopen_osx(string fileName, int flags);

            [DllImport("libSystem.B.dylib", EntryPoint = "dlsym")]
            private static extern IntPtr dlsym_osx(IntPtr handle, string symbol);

            [DllImport("libSystem.B.dylib", EntryPoint = "dlclose")]
            private static extern int dlclose_osx(IntPtr handle);

            // Linux: usually libdl.so.2 (sometimes libdl.so)
            [DllImport("libdl.so.2", EntryPoint = "dlopen")]
            private static extern IntPtr dlopen_linux(string fileName, int flags);

            [DllImport("libdl.so.2", EntryPoint = "dlsym")]
            private static extern IntPtr dlsym_linux(IntPtr handle, string symbol);

            [DllImport("libdl.so.2", EntryPoint = "dlclose")]
            private static extern int dlclose_linux(IntPtr handle);

            private static IntPtr UnixDlopen(string path, int flags)
            {
                if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                    return dlopen_osx(path, flags);

                return dlopen_linux(path, flags);
            }

            private static IntPtr UnixDlsym(IntPtr handle, string symbol)
            {
                if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                    return dlsym_osx(handle, symbol);

                return dlsym_linux(handle, symbol);
            }

            private static void UnixDlclose(IntPtr handle)
            {
                if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                    dlclose_osx(handle);
                else
                    dlclose_linux(handle);
            }
        }
    }
}

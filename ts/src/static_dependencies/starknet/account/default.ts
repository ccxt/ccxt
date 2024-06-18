// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { SPEC } from 'starknet-types-07';
import { UDC, ZERO } from '../constants.js';
import { Provider, ProviderInterface } from '../provider';
import { Signer, SignerInterface } from '../signer';
import {
  Abi,
  AccountInvocations,
  AccountInvocationsFactoryDetails,
  AllowArray,
  BigNumberish,
  BlockIdentifier,
  CairoVersion,
  Call,
  DeclareAndDeployContractPayload,
  DeclareContractPayload,
  DeclareContractResponse,
  DeclareContractTransaction,
  DeclareDeployUDCResponse,
  DeployAccountContractPayload,
  DeployAccountContractTransaction,
  DeployContractResponse,
  DeployContractUDCResponse,
  DeployTransactionReceiptResponse,
  EstimateFee,
  EstimateFeeAction,
  EstimateFeeBulk,
  Invocation,
  Invocations,
  InvocationsSignerDetails,
  InvokeFunctionResponse,
  MultiDeployContractResponse,
  Nonce,
  ProviderOptions,
  Signature,
  SimulateTransactionDetails,
  SimulateTransactionResponse,
  TransactionType,
  TypedData,
  UniversalDeployerContractPayload,
  UniversalDetails,
} from '../types';
import { ETransactionVersion, ETransactionVersion3, ResourceBounds } from '../types/api/index.js';
import { CallData } from '../utils/calldata.js';
import { extractContractHashes, isSierra } from '../utils/contract';
import { parseUDCEvent } from '../utils/events';
import { calculateContractAddressFromHash } from '../utils/hash/index.js';
import { toBigInt, toCairoBool } from '../utils/num.js';
import { parseContract } from '../utils/provider';
import { isString } from '../utils/shortString.js';
import {
  estimateFeeToBounds,
  formatSignature,
  reduceV2,
  toFeeVersion,
  toTransactionVersion,
  v3Details,
} from '../utils/stark';
import { buildUDCCall, getExecuteCalldata } from '../utils/transaction';
import { getMessageHash } from '../utils/typedData';
import { AccountInterface } from './interface';

export class Account extends Provider implements AccountInterface {
  public signer: SignerInterface;

  public address: string;

  public cairoVersion: CairoVersion;

  readonly transactionVersion: ETransactionVersion.V2 | ETransactionVersion.V3;

  constructor(
    providerOrOptions: ProviderOptions | ProviderInterface,
    address: string,
    pkOrSigner: Uint8Array | string | SignerInterface,
    cairoVersion?: CairoVersion,
    transactionVersion: ETransactionVersion.V2 | ETransactionVersion.V3 = ETransactionVersion.V2 // TODO: Discuss this, set to v2 for backward compatibility
  ) {
    super(providerOrOptions);
    this.address = address.toLowerCase();
    this.signer =
      isString(pkOrSigner) || pkOrSigner instanceof Uint8Array
        ? new Signer(pkOrSigner)
        : pkOrSigner;

    if (cairoVersion) {
      this.cairoVersion = cairoVersion.toString() as CairoVersion;
    }
    this.transactionVersion = transactionVersion;
  }

  // provided version or contract based preferred transactionVersion
  protected getPreferredVersion(type12: ETransactionVersion, type3: ETransactionVersion) {
    if (this.transactionVersion === ETransactionVersion.V3) return type3;
    if (this.transactionVersion === ETransactionVersion.V2) return type12;

    return ETransactionVersion.V3;
  }

  public async getNonce(blockIdentifier?: BlockIdentifier): Promise<Nonce> {
    return super.getNonceForAddress(this.address, blockIdentifier);
  }

  protected async getNonceSafe(nonce?: BigNumberish) {
    // Patch DEPLOY_ACCOUNT: RPC getNonce for non-existing address will result in error
    try {
      return toBigInt(nonce ?? (await this.getNonce()));
    } catch (error) {
      return 0n;
    }
  }

  /**
   * Retrieves the Cairo version from the network and sets `cairoVersion` if not already set in the constructor.
   * @param classHash if provided detects Cairo version from classHash, otherwise from the account address
   */
  public async getCairoVersion(classHash?: string) {
    if (!this.cairoVersion) {
      const { cairo } = classHash
        ? await super.getContractVersion(undefined, classHash)
        : await super.getContractVersion(this.address);
      this.cairoVersion = cairo;
    }
    return this.cairoVersion;
  }

  public async estimateFee(
    calls: AllowArray<Call>,
    estimateFeeDetails: UniversalDetails = {}
  ): Promise<EstimateFee> {
    return this.estimateInvokeFee(calls, estimateFeeDetails);
  }

  public async estimateInvokeFee(
    calls: AllowArray<Call>,
    details: UniversalDetails = {}
  ): Promise<EstimateFee> {
    const {
      nonce: providedNonce,
      blockIdentifier,
      version: providedVersion,
      skipValidate = true,
    } = details;

    const transactions = Array.isArray(calls) ? calls : [calls];
    const nonce = toBigInt(providedNonce ?? (await this.getNonce()));
    const version = toTransactionVersion(
      this.getPreferredVersion(ETransactionVersion.F1, ETransactionVersion.F3),
      toFeeVersion(providedVersion)
    );
    const chainId = await this.getChainId();

    const signerDetails: InvocationsSignerDetails = {
      ...v3Details(details),
      walletAddress: this.address,
      nonce,
      maxFee: ZERO,
      version,
      chainId,
      cairoVersion: await this.getCairoVersion(),
      skipValidate,
    };

    const invocation = await this.buildInvocation(transactions, signerDetails);
    return super.getInvokeEstimateFee(
      { ...invocation },
      { ...v3Details(details), version, nonce },
      blockIdentifier,
      details.skipValidate
    );
  }

  public async estimateDeclareFee(
    payload: DeclareContractPayload,
    details: UniversalDetails = {}
  ): Promise<EstimateFee> {
    const {
      blockIdentifier,
      nonce: providedNonce,
      version: providedVersion,
      skipValidate = true,
    } = details;
    const nonce = toBigInt(providedNonce ?? (await this.getNonce()));
    const version = toTransactionVersion(
      !isSierra(payload.contract)
        ? ETransactionVersion.F1
        : this.getPreferredVersion(ETransactionVersion.F2, ETransactionVersion.F3),
      toFeeVersion(providedVersion)
    );
    const chainId = await this.getChainId();

    const declareContractTransaction = await this.buildDeclarePayload(payload, {
      ...v3Details(details),
      nonce,
      chainId,
      version,
      walletAddress: this.address,
      maxFee: ZERO,
      cairoVersion: undefined, // unused parameter
      skipValidate,
    });

    return super.getDeclareEstimateFee(
      declareContractTransaction,
      { ...v3Details(details), version, nonce },
      blockIdentifier,
      details.skipValidate
    );
  }

  public async estimateAccountDeployFee(
    {
      classHash,
      addressSalt = 0,
      constructorCalldata = [],
      contractAddress,
    }: DeployAccountContractPayload,
    details: UniversalDetails = {}
  ): Promise<EstimateFee> {
    const { blockIdentifier, version: providedVersion, skipValidate = true } = details;
    const version = toTransactionVersion(
      this.getPreferredVersion(ETransactionVersion.F1, ETransactionVersion.F3),
      toFeeVersion(providedVersion)
    ); // TODO: Can Cairo0 be deployed with F3 ?
    const nonce = ZERO; // DEPLOY_ACCOUNT transaction will have a nonce zero as it is the first transaction in the account
    const chainId = await this.getChainId();

    const payload = await this.buildAccountDeployPayload(
      { classHash, addressSalt, constructorCalldata, contractAddress },
      {
        ...v3Details(details),
        nonce,
        chainId,
        version,
        walletAddress: this.address, // unused parameter
        maxFee: ZERO,
        cairoVersion: undefined, // unused parameter,
        skipValidate,
      }
    );

    return super.getDeployAccountEstimateFee(
      { ...payload },
      { ...v3Details(details), version, nonce },
      blockIdentifier,
      details.skipValidate
    );
  }

  public async estimateDeployFee(
    payload: UniversalDeployerContractPayload | UniversalDeployerContractPayload[],
    details: UniversalDetails = {}
  ): Promise<EstimateFee> {
    const calls = this.buildUDCContractPayload(payload);
    return this.estimateInvokeFee(calls, details);
  }

  public async estimateFeeBulk(
    invocations: Invocations,
    details: UniversalDetails = {}
  ): Promise<EstimateFeeBulk> {
    const { nonce, blockIdentifier, version, skipValidate } = details;
    const accountInvocations = await this.accountInvocationsFactory(invocations, {
      ...v3Details(details),
      versions: [
        ETransactionVersion.F1, // non-sierra
        toTransactionVersion(
          this.getPreferredVersion(ETransactionVersion.F2, ETransactionVersion.F3),
          version
        ), // sierra
      ],
      nonce,
      blockIdentifier,
      skipValidate,
    });

    return super.getEstimateFeeBulk(accountInvocations, {
      blockIdentifier,
      skipValidate,
    });
  }

  public async simulateTransaction(
    invocations: Invocations,
    details: SimulateTransactionDetails = {}
  ): Promise<SimulateTransactionResponse> {
    const { nonce, blockIdentifier, skipValidate = true, skipExecute, version } = details;
    const accountInvocations = await this.accountInvocationsFactory(invocations, {
      ...v3Details(details),
      versions: [
        ETransactionVersion.V1, // non-sierra
        toTransactionVersion(
          this.getPreferredVersion(ETransactionVersion.V2, ETransactionVersion.V3),
          version
        ),
      ],
      nonce,
      blockIdentifier,
      skipValidate,
    });

    return super.getSimulateTransaction(accountInvocations, {
      blockIdentifier,
      skipValidate,
      skipExecute,
    });
  }

  public async execute(
    transactions: AllowArray<Call>,
    transactionsDetail?: UniversalDetails
  ): Promise<InvokeFunctionResponse>;
  public async execute(
    transactions: AllowArray<Call>,
    abis?: Abi[],
    transactionsDetail?: UniversalDetails
  ): Promise<InvokeFunctionResponse>;
  public async execute(
    transactions: AllowArray<Call>,
    arg2?: Abi[] | UniversalDetails,
    transactionsDetail: UniversalDetails = {}
  ): Promise<InvokeFunctionResponse> {
    const details = arg2 === undefined || Array.isArray(arg2) ? transactionsDetail : arg2;
    const calls = Array.isArray(transactions) ? transactions : [transactions];
    const nonce = toBigInt(details.nonce ?? (await this.getNonce()));
    const version = toTransactionVersion(
      this.getPreferredVersion(ETransactionVersion.V1, ETransactionVersion.V3), // TODO: does this depend on cairo version ?
      details.version
    );

    const estimate = await this.getUniversalSuggestedFee(
      version,
      { type: TransactionType.INVOKE, payload: transactions },
      {
        ...details,
        version,
      }
    );

    const chainId = await this.getChainId();

    const signerDetails: InvocationsSignerDetails = {
      ...v3Details(details),
      resourceBounds: estimate.resourceBounds,
      walletAddress: this.address,
      nonce,
      maxFee: estimate.maxFee,
      version,
      chainId,
      cairoVersion: await this.getCairoVersion(),
    };

    const signature = await this.signer.signTransaction(calls, signerDetails);

    const calldata = getExecuteCalldata(calls, await this.getCairoVersion());

    return this.invokeFunction(
      { contractAddress: this.address, calldata, signature },
      {
        ...v3Details(details),
        resourceBounds: estimate.resourceBounds,
        nonce,
        maxFee: estimate.maxFee,
        version,
      }
    );
  }

  /**
   * First check if contract is already declared, if not declare it
   * If contract already declared returned transaction_hash is ''.
   * Method will pass even if contract is already declared
   * @param transactionsDetail (optional)
   */
  public async declareIfNot(
    payload: DeclareContractPayload,
    transactionsDetail: UniversalDetails = {}
  ): Promise<DeclareContractResponse> {
    const declareContractPayload = extractContractHashes(payload);
    try {
      await this.getClassByHash(declareContractPayload.classHash);
    } catch (error) {
      return this.declare(payload, transactionsDetail);
    }
    return {
      transaction_hash: '',
      class_hash: declareContractPayload.classHash,
    };
  }

  public async declare(
    payload: DeclareContractPayload,
    details: UniversalDetails = {}
  ): Promise<DeclareContractResponse> {
    const declareContractPayload = extractContractHashes(payload);
    const { nonce, version: providedVersion } = details;
    const version = toTransactionVersion(
      !isSierra(payload.contract)
        ? ETransactionVersion.V1
        : this.getPreferredVersion(ETransactionVersion.V2, ETransactionVersion.V3),
      providedVersion
    );

    const estimate = await this.getUniversalSuggestedFee(
      version,
      {
        type: TransactionType.DECLARE,
        payload: declareContractPayload,
      },
      {
        ...details,
        version,
      }
    );

    const declareDetails: InvocationsSignerDetails = {
      ...v3Details(details),
      resourceBounds: estimate.resourceBounds,
      maxFee: estimate.maxFee,
      nonce: toBigInt(nonce ?? (await this.getNonce())),
      version,
      chainId: await this.getChainId(),
      walletAddress: this.address,
      cairoVersion: undefined,
    };

    const declareContractTransaction = await this.buildDeclarePayload(
      declareContractPayload,
      declareDetails
    );

    return this.declareContract(declareContractTransaction, declareDetails);
  }

  public async deploy(
    payload: UniversalDeployerContractPayload | UniversalDeployerContractPayload[],
    details: UniversalDetails = {}
  ): Promise<MultiDeployContractResponse> {
    const { calls, addresses } = buildUDCCall(payload, this.address);
    const invokeResponse = await this.execute(calls, undefined, details);

    return {
      ...invokeResponse,
      contract_address: addresses,
    };
  }

  public async deployContract(
    payload: UniversalDeployerContractPayload | UniversalDeployerContractPayload[],
    details: UniversalDetails = {}
  ): Promise<DeployContractUDCResponse> {
    const deployTx = await this.deploy(payload, details);
    const txReceipt = await this.waitForTransaction(deployTx.transaction_hash);
    return parseUDCEvent(txReceipt as unknown as DeployTransactionReceiptResponse);
  }

  public async declareAndDeploy(
    payload: DeclareAndDeployContractPayload,
    details: UniversalDetails = {}
  ): Promise<DeclareDeployUDCResponse> {
    const { constructorCalldata, salt, unique } = payload;
    let declare = await this.declareIfNot(payload, details);
    if (declare.transaction_hash !== '') {
      const tx = await this.waitForTransaction(declare.transaction_hash);
      declare = { ...declare, ...tx };
    }
    const deploy = await this.deployContract(
      { classHash: declare.class_hash, salt, unique, constructorCalldata },
      details
    );
    return { declare: { ...declare }, deploy };
  }

  public deploySelf = this.deployAccount;

  public async deployAccount(
    {
      classHash,
      constructorCalldata = [],
      addressSalt = 0,
      contractAddress: providedContractAddress,
    }: DeployAccountContractPayload,
    details: UniversalDetails = {}
  ): Promise<DeployContractResponse> {
    const version = toTransactionVersion(
      this.getPreferredVersion(ETransactionVersion.V1, ETransactionVersion.V3),
      details.version
    );
    const nonce = ZERO; // DEPLOY_ACCOUNT transaction will have a nonce zero as it is the first transaction in the account
    const chainId = await this.getChainId();

    const compiledCalldata = CallData.compile(constructorCalldata);
    const contractAddress =
      providedContractAddress ??
      calculateContractAddressFromHash(addressSalt, classHash, compiledCalldata, 0);

    const estimate = await this.getUniversalSuggestedFee(
      version,
      {
        type: TransactionType.DEPLOY_ACCOUNT,
        payload: {
          classHash,
          constructorCalldata: compiledCalldata,
          addressSalt,
          contractAddress,
        },
      },
      details
    );

    const signature = await this.signer.signDeployAccountTransaction({
      ...v3Details(details),
      classHash,
      constructorCalldata: compiledCalldata,
      contractAddress,
      addressSalt,
      chainId,
      resourceBounds: estimate.resourceBounds,
      maxFee: estimate.maxFee,
      version,
      nonce,
    });

    return this.deployAccountContract(
      { classHash, addressSalt, constructorCalldata, signature },
      {
        ...v3Details(details),
        nonce,
        resourceBounds: estimate.resourceBounds,
        maxFee: estimate.maxFee,
        version,
      }
    );
  }

  public async signMessage(typedData: TypedData): Promise<Signature> {
    return this.signer.signMessage(typedData, this.address);
  }

  public async hashMessage(typedData: TypedData): Promise<string> {
    return getMessageHash(typedData, this.address);
  }

  public async verifyMessageHash(
    hash: BigNumberish,
    signature: Signature,
    signatureVerificationFunctionName?: string,
    signatureVerificationResponse?: { okResponse: string[]; nokResponse: string[]; error: string[] }
  ): Promise<boolean> {
    // HOTFIX: Accounts should conform to SNIP-6
    // (https://github.com/starknet-io/SNIPs/blob/f6998f779ee2157d5e1dea36042b08062093b3c5/SNIPS/snip-6.md?plain=1#L61),
    // but they don't always conform. Also, the SNIP doesn't standardize the response if the signature isn't valid.
    const knownSigVerificationFName = signatureVerificationFunctionName
      ? [signatureVerificationFunctionName]
      : ['isValidSignature', 'is_valid_signature'];
    const knownSignatureResponse = signatureVerificationResponse || {
      okResponse: [
        // any non-nok response is true
      ],
      nokResponse: [
        '0x0', // Devnet
        '0x00', // OpenZeppelin 0.7.0 to 0.9.0 invalid signature
      ],
      error: [
        'argent/invalid-signature', // ArgentX 0.3.0 to 0.3.1
        'is invalid, with respect to the public key', // OpenZeppelin until 0.6.1, Braavos 0.0.11
        'INVALID_SIG', // Braavos 1.0.0
      ],
    };
    let error: any;

    // eslint-disable-next-line no-restricted-syntax
    for (const SigVerificationFName of knownSigVerificationFName) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const resp = await this.callContract({
          contractAddress: this.address,
          entrypoint: SigVerificationFName,
          calldata: CallData.compile({
            hash: toBigInt(hash).toString(),
            signature: formatSignature(signature),
          }),
        });
        // Response NOK Signature
        if (knownSignatureResponse.nokResponse.includes(resp[0].toString())) {
          return false;
        }
        // Response OK Signature
        // Empty okResponse assume all non-nok responses are valid signatures
        // OpenZeppelin 0.7.0 to 0.9.0, ArgentX 0.3.0 to 0.3.1 & Braavos Cairo 0.0.11 to 1.0.0 valid signature
        if (
          knownSignatureResponse.okResponse.length === 0 ||
          knownSignatureResponse.okResponse.includes(resp[0].toString())
        ) {
          return true;
        }
        throw Error('signatureVerificationResponse Error: response is not part of known responses');
      } catch (err) {
        // Known NOK Errors
        if (
          knownSignatureResponse.error.some((errMessage) =>
            (err as Error).message.includes(errMessage)
          )
        ) {
          return false;
        }
        // Unknown Error
        error = err;
      }
    }

    throw Error(`Signature verification Error: ${error}`);
  }

  public async verifyMessage(
    typedData: TypedData,
    signature: Signature,
    signatureVerificationFunctionName?: string,
    signatureVerificationResponse?: { okResponse: string[]; nokResponse: string[]; error: string[] }
  ): Promise<boolean> {
    const hash = await this.hashMessage(typedData);
    return this.verifyMessageHash(
      hash,
      signature,
      signatureVerificationFunctionName,
      signatureVerificationResponse
    );
  }

  /*
   * Support methods
   */

  protected async getUniversalSuggestedFee(
    version: ETransactionVersion,
    { type, payload }: EstimateFeeAction,
    details: UniversalDetails
  ) {
    let maxFee: BigNumberish = 0;
    let resourceBounds: ResourceBounds = estimateFeeToBounds(ZERO);
    if (version === ETransactionVersion.V3) {
      resourceBounds =
        details.resourceBounds ??
        (await this.getSuggestedFee({ type, payload } as any, details)).resourceBounds;
    } else {
      maxFee =
        details.maxFee ??
        (await this.getSuggestedFee({ type, payload } as any, details)).suggestedMaxFee;
    }

    return {
      maxFee,
      resourceBounds,
    };
  }

  public async getSuggestedFee({ type, payload }: EstimateFeeAction, details: UniversalDetails) {
    let feeEstimate: EstimateFee;

    switch (type) {
      case TransactionType.INVOKE:
        feeEstimate = await this.estimateInvokeFee(payload, details);
        break;

      case TransactionType.DECLARE:
        feeEstimate = await this.estimateDeclareFee(payload, details);
        break;

      case TransactionType.DEPLOY_ACCOUNT:
        feeEstimate = await this.estimateAccountDeployFee(payload, details);
        break;

      case TransactionType.DEPLOY:
        feeEstimate = await this.estimateDeployFee(payload, details);
        break;

      default:
        feeEstimate = {
          gas_consumed: 0n,
          gas_price: 0n,
          overall_fee: ZERO,
          unit: 'FRI',
          suggestedMaxFee: ZERO,
          resourceBounds: estimateFeeToBounds(ZERO),
          data_gas_consumed: 0n,
          data_gas_price: 0n,
        };
        break;
    }

    return feeEstimate;
  }

  public async buildInvocation(
    call: Array<Call>,
    details: InvocationsSignerDetails
  ): Promise<Invocation> {
    const calldata = getExecuteCalldata(call, await this.getCairoVersion());
    const signature = !details.skipValidate ? await this.signer.signTransaction(call, details) : [];

    return {
      ...v3Details(details),
      contractAddress: this.address,
      calldata,
      signature,
    };
  }

  public async buildDeclarePayload(
    payload: DeclareContractPayload,
    details: InvocationsSignerDetails
  ): Promise<DeclareContractTransaction> {
    const { classHash, contract, compiledClassHash } = extractContractHashes(payload);
    const compressedCompiledContract = parseContract(contract);

    if (
      typeof compiledClassHash === 'undefined' &&
      (details.version === ETransactionVersion3.F3 || details.version === ETransactionVersion3.V3)
    ) {
      throw Error('V3 Transaction work with Cairo1 Contracts and require compiledClassHash');
    }

    const signature = !details.skipValidate
      ? await this.signer.signDeclareTransaction({
          ...details,
          ...v3Details(details),
          classHash,
          compiledClassHash: compiledClassHash as string, // TODO: TS, cast because optional for v2 and required for v3, thrown if not present
          senderAddress: details.walletAddress,
        })
      : [];

    return {
      senderAddress: details.walletAddress,
      signature,
      contract: compressedCompiledContract,
      compiledClassHash,
    };
  }

  public async buildAccountDeployPayload(
    {
      classHash,
      addressSalt = 0,
      constructorCalldata = [],
      contractAddress: providedContractAddress,
    }: DeployAccountContractPayload,
    details: InvocationsSignerDetails
  ): Promise<DeployAccountContractTransaction> {
    const compiledCalldata = CallData.compile(constructorCalldata);
    const contractAddress =
      providedContractAddress ??
      calculateContractAddressFromHash(addressSalt, classHash, compiledCalldata, 0);

    const signature = !details.skipValidate
      ? await this.signer.signDeployAccountTransaction({
          ...details,
          ...v3Details(details),
          classHash,
          contractAddress,
          addressSalt,
          constructorCalldata: compiledCalldata,
        })
      : [];

    return {
      ...v3Details(details),
      classHash,
      addressSalt,
      constructorCalldata: compiledCalldata,
      signature,
    };
  }

  public buildUDCContractPayload(
    payload: UniversalDeployerContractPayload | UniversalDeployerContractPayload[]
  ): Call[] {
    const calls = [].concat(payload as []).map((it) => {
      const {
        classHash,
        salt = '0',
        unique = true,
        constructorCalldata = [],
      } = it as UniversalDeployerContractPayload;
      const compiledConstructorCallData = CallData.compile(constructorCalldata);

      return {
        contractAddress: UDC.ADDRESS,
        entrypoint: UDC.ENTRYPOINT,
        calldata: [
          classHash,
          salt,
          toCairoBool(unique),
          compiledConstructorCallData.length,
          ...compiledConstructorCallData,
        ],
      };
    });
    return calls;
  }

  public async accountInvocationsFactory(
    invocations: Invocations,
    details: AccountInvocationsFactoryDetails
  ) {
    const { nonce, blockIdentifier, skipValidate = true } = details;
    const safeNonce = await this.getNonceSafe(nonce);
    const chainId = await this.getChainId();
    const versions = details.versions.map((it) => toTransactionVersion(it));

    // BULK ACTION FROM NEW ACCOUNT START WITH DEPLOY_ACCOUNT
    const tx0Payload: any = 'payload' in invocations[0] ? invocations[0].payload : invocations[0];
    const cairoVersion =
      invocations[0].type === TransactionType.DEPLOY_ACCOUNT
        ? await this.getCairoVersion(tx0Payload.classHash)
        : await this.getCairoVersion();

    return Promise.all(
      ([] as Invocations).concat(invocations).map(async (transaction, index: number) => {
        const txPayload: any = 'payload' in transaction ? transaction.payload : transaction;
        const signerDetails = {
          ...v3Details(details),
          walletAddress: this.address,
          nonce: toBigInt(Number(safeNonce) + index),
          maxFee: ZERO,
          chainId,
          cairoVersion,
          version: '' as ETransactionVersion,
          skipValidate,
        };
        const common = {
          type: transaction.type,
          nonce: toBigInt(Number(safeNonce) + index),
          blockIdentifier,
          version: '' as ETransactionVersion,
        };

        if (transaction.type === TransactionType.INVOKE) {
          // 1 or 3
          const versionX = reduceV2(versions[1]);
          signerDetails.version = versionX;
          common.version = versionX;

          const payload = await this.buildInvocation(
            ([] as Call[]).concat(txPayload),
            signerDetails
          );
          return {
            ...common,
            ...payload,
          };
        }
        if (transaction.type === TransactionType.DEPLOY) {
          // 1 or 3
          const versionX = reduceV2(versions[1]);
          signerDetails.version = versionX;
          common.version = versionX;

          const calls = this.buildUDCContractPayload(txPayload);
          const payload = await this.buildInvocation(calls, signerDetails);
          return {
            ...common,
            ...payload,
            type: TransactionType.INVOKE,
          };
        }
        if (transaction.type === TransactionType.DECLARE) {
          // 1 (Cairo0) or 2 or 3
          const versionX = !isSierra(txPayload.contract) ? versions[0] : versions[1];
          signerDetails.version = versionX;
          common.version = versionX;

          const payload = await this.buildDeclarePayload(txPayload, signerDetails);
          return {
            ...common,
            ...payload,
          };
        }
        if (transaction.type === TransactionType.DEPLOY_ACCOUNT) {
          // 1 or 3
          const versionX = reduceV2(versions[1]);
          signerDetails.version = versionX;
          common.version = versionX;

          const payload = await this.buildAccountDeployPayload(txPayload, signerDetails);
          return {
            ...common,
            ...payload,
          };
        }
        throw Error(`accountInvocationsFactory: unsupported transaction type: ${transaction}`);
      })
    ) as Promise<AccountInvocations>;
  }

  public async getStarkName(
    address: BigNumberish = this.address, // default to the wallet address
    StarknetIdContract?: string
  ): Promise<string> {
    return super.getStarkName(address, StarknetIdContract);
  }
}

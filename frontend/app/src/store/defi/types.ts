import { default as BigNumber } from 'bignumber.js';
import {
  CollateralAssetType,
  DefiBalanceType,
  DSRMovementType,
  EventType,
  MakerDAOVaultEventType,
  SupportedDefiProtocols
} from '@/services/defi/types';
import {
  AaveBalances,
  AaveBorrowingRates,
  AaveHistory,
  AaveHistoryEvents,
  AaveHistoryTotal
} from '@/services/defi/types/aave';
import {
  CompoundBalances,
  CompoundEventType,
  CompoundHistory
} from '@/services/defi/types/compound';
import { UniswapAsset, UniswapBalances } from '@/services/defi/types/uniswap';
import {
  YearnEventType,
  YearnVaultsBalances,
  YearnVaultsHistory
} from '@/services/defi/types/yearn';
import { TradeType } from '@/services/history/types';
import { Balance, HasBalance } from '@/services/types-api';
import { OVERVIEW_PROTOCOLS } from '@/store/defi/const';

export type OverviewDefiProtocol = typeof OVERVIEW_PROTOCOLS[number];

export interface DefiState {
  dsrHistory: DSRHistory;
  dsrBalances: DSRBalances;
  makerDAOVaults: MakerDAOVault[];
  makerDAOVaultDetails: MakerDAOVaultDetails[];
  aaveBalances: AaveBalances;
  aaveHistory: AaveHistory;
  allProtocols: AllDefiProtocols;
  compoundBalances: CompoundBalances;
  compoundHistory: CompoundHistory;
  yearnVaultsHistory: YearnVaultsHistory;
  yearnVaultsBalances: YearnVaultsBalances;
  uniswapBalances: UniswapBalances;
}

export interface DSRBalances {
  readonly currentDSR: BigNumber;
  readonly balances: {
    [account: string]: {
      amount: BigNumber;
      usdValue: BigNumber;
    };
  };
}

interface DSRHistoryItem {
  readonly gainSoFar: Balance;
  readonly movements: DSRMovement[];
}

export interface DSRHistory {
  readonly [address: string]: DSRHistoryItem;
}

interface DSRMovement {
  readonly movementType: DSRMovementType;
  readonly gainSoFar: Balance;
  readonly value: Balance;
  readonly blockNumber: number;
  readonly timestamp: number;
  readonly txHash: string;
}

export interface Collateral<T extends CollateralAssetType | string>
  extends Balance {
  readonly asset: T;
}

export interface MakerDAOVault
  extends CollateralizedLoan<Collateral<CollateralAssetType>> {
  readonly collateralType: string;
  readonly collateralizationRatio?: string;
  readonly stabilityFee: string;
  readonly liquidationRatio: string;
  readonly liquidationPrice: BigNumber;
}

export interface MakerDAOVaultDetails {
  readonly identifier: string;
  readonly creationTs: number;
  readonly totalInterestOwed: BigNumber;
  readonly totalLiquidated: Balance;
  readonly events: MakerDAOVaultEvent[];
}

interface MakerDAOVaultEvent {
  readonly eventType: MakerDAOVaultEventType;
  readonly value: Balance;
  readonly timestamp: number;
  readonly txHash: string;
}

export type MakerDAOVaultModel =
  | MakerDAOVault
  | (MakerDAOVault & MakerDAOVaultDetails);

export interface LoanSummary {
  readonly totalCollateralUsd: BigNumber;
  readonly totalDebt: BigNumber;
}

export interface CollateralizedLoan<
  C extends
    | Collateral<CollateralAssetType | string>
    | Collateral<CollateralAssetType | string>[]
> extends DefiLoan {
  readonly collateral: C;
  readonly debt: Balance;
}

export interface AaveLoan
  extends AaveBorrowingRates,
    CollateralizedLoan<Collateral<string>[]> {
  readonly events: AaveHistoryEvents[];
  readonly totalLost: AaveHistoryTotal;
  readonly liquidationEarned: AaveHistoryTotal;
}

export interface DefiBalance extends BaseDefiBalance {
  readonly address: string;
  readonly protocol: SupportedDefiProtocols;
}

export interface BaseDefiBalance extends HasBalance {
  readonly effectiveInterestRate: string;
  readonly asset: string;
}

interface MakerDAOLendingHistoryExtras {
  gainSoFar: Balance;
}

interface HistoryExtras<T> {
  readonly eventType: T;
  readonly asset: string;
  readonly value: Balance;
  readonly toAsset?: string;
  readonly toValue: Balance;
  readonly realizedPnl?: Balance;
}

interface LendingHistoryExtras {
  readonly aave: {};
  readonly makerdao: MakerDAOLendingHistoryExtras;
  readonly compound: HistoryExtras<CompoundEventType>;
  readonly yearn_vaults: HistoryExtras<YearnEventType>;
  readonly uniswap: {};
}

export interface DefiLendingHistory<T extends SupportedDefiProtocols> {
  id: string;
  eventType: EventType;
  protocol: T;
  address: string;
  asset: string;
  value: Balance;
  extras: LendingHistoryExtras[T];
  blockNumber: number;
  timestamp: number;
  txHash: string;
}

export interface DefiLoan {
  readonly identifier: string;
  readonly protocol: SupportedDefiProtocols;
  readonly asset?: string;
  readonly owner?: string;
}

interface DefiProtocolInfo {
  readonly name: OverviewDefiProtocol;
}

interface DefiProtocolInfoWithIcon extends DefiProtocolInfo {
  readonly icon: string;
}

interface TokenInfo {
  readonly tokenName: string;
  readonly tokenSymbol: string;
}

export interface DefiProtocolSummary {
  readonly protocol: DefiProtocolInfoWithIcon;
  readonly balanceUsd?: BigNumber;
  readonly assets: DefiAsset[];
  readonly tokenInfo?: TokenInfo;
  readonly depositsUrl?: string;
  readonly liabilitiesUrl?: string;
  readonly totalCollateralUsd: BigNumber;
  readonly totalDebtUsd: BigNumber;
  readonly totalLendingDepositUsd: BigNumber;
}

export interface DefiAsset extends HasBalance {
  readonly tokenAddress: string;
  readonly tokenName: string;
  readonly tokenSymbol: string;
}

interface DefiProtocolData {
  readonly protocol: DefiProtocolInfo;
  readonly balanceType: DefiBalanceType;
  readonly baseBalance: DefiAsset;
  readonly underlyingBalances: DefiAsset[];
}

export interface AllDefiProtocols {
  readonly [asset: string]: DefiProtocolData[];
}

export interface ProfitLossModel {
  readonly address: string;
  readonly asset: string;
  readonly value: Balance;
}

export interface UniswapBalance {
  readonly account: string;
  readonly assets: UniswapAsset[];
  readonly poolAddress: string;
  readonly totalSupply: BigNumber;
  readonly userBalance: Balance;
}

interface UniswapSwap {
  readonly amount0In: BigNumber;
  readonly amount0Out: BigNumber;
  readonly amount1In: BigNumber;
  readonly amount1Out: BigNumber;
  readonly fromAddress: string;
  readonly location: 'uniswap';
  readonly logIndex: number;
  readonly toAddress: string;
  readonly token0: string;
  readonly token1: string;
  readonly txHash: string;
}

interface UniswapTrade {
  readonly address: string;
  readonly amount: BigNumber;
  readonly baseAsset: string;
  readonly fee: BigNumber;
  readonly feeCurrency: string;
  readonly location: 'uniswap';
  readonly pair: string;
  readonly quoteAsset: string;
  readonly rate: BigNumber;
  readonly swaps: UniswapSwap[];
  readonly timestamp: number;
  readonly tradeId: string;
  readonly tradeType: TradeType;
  readonly txHash: string;
}

export interface UniswapTrades {
  readonly [address: string]: UniswapTrade[];
}

import chalkAnimation from "chalk-animation";
import search, { Separator } from "@inquirer/search";
import { listTokens } from "./listTokens";
import { getPoolsForToken } from "./getPoolsForToken";
import { select } from "@inquirer/prompts";
import { initWallet } from "./wallet";
import { HttpAgent } from "@dfinity/agent";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { input } from "@inquirer/prompts";
import ora from "ora";
import { swap } from "./swap";

// Display welcome message

// List of items to search

function getDecimals(meta: [string, any][]): bigint | undefined {
  for (const [key, value] of meta) {
    if (key === "icrc1:decimals" && value.Nat !== undefined) {
      return value.Nat;
    }
  }
  return undefined;
}

function truncateBalance(balance: bigint, decimals: bigint): string {
  const divisor = Number(BigInt(10) ** decimals);
  const truncatedBalance = Number(balance) / divisor;
  return truncatedBalance.toFixed(5);
}

const main = async () => {
  const wallet = initWallet(process.env.SEED as string);

  const firstMess = chalkAnimation.rainbow(
    "Using wallet with principal ID: " + wallet.principal.toString()
  );

  firstMess.start();

  const agent = HttpAgent.createSync({
    host: "https://ic0.app",
    identity: wallet.identity,
  });

  const tokens = await listTokens();

  // Prompt the user to search the list
  const selectedTokenAddress = await search({
    message: "Select an token",
    source: async (input, { signal }) => {
      if (!input) {
        return [];
      }

      const response = tokens.filter((t) =>
        t.name.toLowerCase().includes(input.toLowerCase())
      );

      return response.map((t) => {
        return {
          name: `${t.name} - (${t.symbol}) - ${t.address} - Vol 1d ${t.volumeUSD1d} - Vol 7d ${t.volumeUSD7d}`,
          value: t.address,
          description: t.symbol,
        };
      });
    },
  });

  const poolsOfSelectedToken = await getPoolsForToken(selectedTokenAddress);

  const selectedPool = await search({
    message: "Select a pool",
    source: async (input, { signal }) => {
      if (!input) {
        return [];
      }

      const response = poolsOfSelectedToken.filter(
        (t) =>
          t.token0Symbol.toLowerCase().includes(input.toLowerCase()) ||
          t.token1Symbol.toLowerCase().includes(input.toLowerCase())
      );

      return response.map((t) => {
        return {
          name: `${t.token0Symbol} - ${t.token1Symbol}`,
          value: t,
          description: `${t.token0Id} - ${t.token1Id}`,
        };
      });
    },
  });

  const spinner = ora("Fetching token balances and metadata...").start();

  const { balance: token0Balance, metadata: token0Metadata } =
    IcrcLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(selectedPool.token0Id),
    });
  const { balance: token1Balance, metadata: token1Metadata } =
    IcrcLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(selectedPool.token1Id),
    });

  const [userToken0Bal, userToken1Bal, token0Meta, token1Meta]: [
    bigint,
    bigint,
    [string, any][],
    [string, any][]
  ] = await Promise.all([
    token0Balance({
      owner: wallet.principal,
    }),
    token1Balance({
      owner: wallet.principal,
    }),
    token0Metadata({}),
    token1Metadata({}),
  ]);

  spinner.succeed("Fetched token balances and metadata");

  const token0Decimals = getDecimals(token0Meta) ?? BigInt(1e8);
  const token1Decimals = getDecimals(token1Meta) ?? BigInt(1e8);

  const truncatedToken0Bal = truncateBalance(userToken0Bal, token0Decimals);
  const truncatedToken1Bal = truncateBalance(userToken1Bal, token1Decimals);

  console.log(
    `Your balance for ${selectedPool.token0Symbol} is ${truncatedToken0Bal}`
  );
  console.log(
    `Your balance for ${selectedPool.token1Symbol} is ${truncatedToken1Bal}`
  );

  const selectTokenSwap: {
    address: string;
    symbol: string;
    currentBal: bigint;
    decimals: number;
  } = await select({
    message: "Select a token to swap",
    choices: [
      {
        name: `${selectedPool.token0Symbol} - ${truncatedToken0Bal}`,
        value: {
          address: selectedPool.token0Id,
          symbol: selectedPool.token0Symbol,
          currentBal: userToken0Bal,
          decimals: Number(token0Decimals),
        },
      },
      {
        name: `${selectedPool.token1Symbol} - ${truncatedToken1Bal}`,
        value: {
          address: selectedPool.token1Id,
          symbol: selectedPool.token1Symbol,
          currentBal: userToken1Bal,
          decimals: Number(token1Decimals),
        },
      },
    ],
  });

  const amount = await input({
    message: `Enter the amount to swap (in ${selectTokenSwap.symbol})`,
  });

  if (
    selectTokenSwap.currentBal <
    BigInt(Number(amount) * 10 ** selectTokenSwap.decimals)
  ) {
    console.error("Insufficient balance");
    return;
  }

  const swapSpinner = ora("Swapping tokens...").start();

  console.log(selectedPool);
  const swapAmount = Number(amount) * 10 ** selectTokenSwap.decimals;

  console.log(swapAmount);

  const swapRes = await swap({
    amount: swapAmount,
    agent,
    poolCanisterId: selectedPool.pool,
    swapToken: selectTokenSwap.address,
  });

  console.log(swapRes);

  swapSpinner.succeed("Swapped tokens");
};

main();

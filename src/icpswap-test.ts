import { Agent, HttpAgent } from "@dfinity/agent";
import { initWallet } from "./wallet";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import {
  ICPSwap,
  ICPSwapPool,
  kongswap,
  KongSwap,
  KONGSWAP_BACKEND_CANISTER,
  KONGSWAP_BACKEND_TEST_CANISTER,
  KongSwapPool,
} from "@rainbow-ic/sunbeam";

const main = async () => {
  const wallet = initWallet(process.env.SEED as string);

  console.log("Using wallet with principal ID: " + wallet.principal.toString());

  const agent: Agent = HttpAgent.createSync({
    host: "https://ic0.app",
    identity: wallet.identity,
  });

  const tokenIn = {
    address: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    token: "ICP",
  };

  const tokenOut = {
    address: "rh2pm-ryaaa-aaaan-qeniq-cai",
    token: "EXE",
  };

  const icpswap = new ICPSwap({
    agent,
  });

  const pool = await icpswap.getPool(tokenIn, tokenOut);
  if (!pool) {
    console.log("Pool not found");
    return;
  }
  const amountIn = BigInt(1_000_000);

  const quote = await pool.quote({
    tokenIn,
    amountIn: amountIn,
    slippage: 0,
  });

  const swapArgs = {
    tokenIn,
    amountOut: quote,
    amountIn: amountIn,
    slippage: 0,
  };

  const ledgerTxs = await pool.prepareSwap(swapArgs);
  const swapRes = await pool.swap(swapArgs);

  console.log("swapRes: ", swapRes);
};

main();

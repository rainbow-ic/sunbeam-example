import { Agent, HttpAgent } from "@dfinity/agent";
import { initWallet } from "./wallet";
import {
  KongSwap,
  KONGSWAP_BACKEND_CANISTER,
  KONGSWAP_BACKEND_TEST_CANISTER,
  KongSwapPool,
} from "@rainbow-ic/sunbeam";
import { safeParseJSON } from "./utils";

const main = async () => {
  const wallet = initWallet(process.env.SEED as string);

  console.log("Using wallet with principal ID: " + wallet.principal.toString());

  const agent: Agent = HttpAgent.createSync({
    host: "https://ic0.app",
    identity: wallet.identity,
  });

  const dex = new KongSwap({
    agent,
    address: KONGSWAP_BACKEND_TEST_CANISTER,
  });

  const tokenIn = {
    address: "rh2pm-ryaaa-aaaan-qeniq-cai",
    chain: "IC",
    token: "EXE",
  };

  const tokenOut = {
    address: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    chain: "IC",
    token: "ICP",
  };

  // const res = await Promise.all(ptask);

  const amountIn = BigInt(1_000_000);

  const poolInfo = {
    address: "",
    token1: tokenIn,
    token2: tokenOut,
  };

  const pool = new KongSwapPool({
    agent,
    address: KONGSWAP_BACKEND_CANISTER,
    poolInfo,
  });

  const quote = await pool.quote({
    tokenIn: tokenIn,
    amountIn: amountIn,
    slippage: 0.01,
  });
  console.log("quote", quote);

  const swapArgs = {
    tokenIn: tokenIn,
    amountOut: quote,
    amountIn: amountIn,
    slippage: 0,
    approveAmount: amountIn * BigInt(6),
  };

  const prepareSwapRes = await pool.prepareSwap(swapArgs);
  console.log(
    "prepareSwapRes: ",
    prepareSwapRes.map((tx) => safeParseJSON(tx))
  );

  const swap1Res = await pool.swap({ ...swapArgs, ledgerTxs: prepareSwapRes });

  console.log("swap1Res: ", swap1Res);

  // console.timeEnd("swap");
};

try {
  main();
} catch (e) {
  console.log(e);
}

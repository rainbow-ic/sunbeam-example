import { HttpAgent } from "@dfinity/agent";
import { initWallet } from "./wallet";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import {
  KongSwap,
  KONGSWAP_BACKEND_CANISTER,
  KongSwapPool,
} from "@rainbow-ic/sunbeam";

const main = async () => {
  const wallet = initWallet(process.env.SEED as string);

  console.log("Using wallet with principal ID: " + wallet.principal.toString());

  const agent = HttpAgent.createSync({
    host: "https://ic0.app",
    identity: wallet.identity,
  });

  const dex = new KongSwap({
    agent,
  });

  // zdzgz-siaaa-aaaar-qaiba-cai = ckUSDT in Kong test
  const poolAddress =
    "IC.lkr76-qyaaa-aaaam-adlba-cai_IC.zdzgz-siaaa-aaaar-qaiba-cai";
  const pool_ids = poolAddress.split("_");
  const token1 = pool_ids[0];
  const token1Canister = token1.replace("IC.", "");
  // WARNING: This is a hardcoded token data for token
  const token1Data = {
    symbol: "test",
    name: "test",
    address: token1Canister,
  };

  const token2 = pool_ids[1];
  const token2Canister = token2.replace("IC.", "");
  const token2Data = await dex.getToken(token2);

  if (!token2Data) {
    throw new Error("Token not found");
  }

  const { approve: token1Approve, allowance: token1Allowance } =
    IcrcLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(token1Canister),
    });
  const { approve: token2Approve, allowance: token2Allowance } =
    IcrcLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(token2Data.canister_id),
    });

  const ptask = [];

  const [token2AllowanceRes] = await Promise.all([
    token2Allowance({
      account: {
        owner: wallet.principal,
        subaccount: [],
      },
      spender: {
        owner: Principal.fromText(KONGSWAP_BACKEND_CANISTER),
        subaccount: [],
      },
    }),
  ]);

  console.log("token2AllowanceRes", token2AllowanceRes);

  if (token2AllowanceRes.allowance < BigInt(1000000000000000)) {
    ptask.push(
      token2Approve({
        spender: {
          owner: Principal.fromText(KONGSWAP_BACKEND_CANISTER),
          subaccount: [],
        },
        amount: BigInt(1000000000000000),
      })
    );
  }

  const res = await Promise.all(ptask);
  console.log("res", res);

  console.time("swap");

  const poolData = {
    address: poolAddress,
    token1: token1Data,
    token2: token2Data,
  };

  const pool = new KongSwapPool({
    agent,
    poolData,
  });

  const metadata = await pool.getMetadata();
  console.log("metadata", metadata);

  const tokenIn = token2;
  const tokenOut = token1;
  const amountIn = BigInt(1_000_000);

  let tokenInChain;
  let tokenInAddress;
  let tokenOutChain;
  let tokenOutAddress;

  if (metadata.address_0 === tokenIn) {
    tokenInChain = metadata.chain_0;
    tokenInAddress = metadata.address_0;
    tokenOutChain = metadata.chain_1;
    tokenOutAddress = metadata.address_1;
  } else {
    tokenInChain = metadata.chain_1;
    tokenInAddress = metadata.address_1;
    tokenOutChain = metadata.chain_0;
    tokenOutAddress = metadata.address_0;
  }

  const quote = await pool.quote({
    tokenIn,
    amountIn,
    tokenOut,
  });

  console.log("quote", quote);

  let swapArgs;

  const swap1Res = await pool.swap({
    tokenIn: `${tokenInChain}.${tokenInAddress}`,
    amountIn: quote.pay_amount,
    tokenOut: `${tokenOutChain}.${tokenOutAddress}`,
    amountOut: quote.receive_amount,
    slippage: quote.slippage,
  });

  console.log("swap1Res", swap1Res);

  //   const quote2 = await dex.swap_amount({
  //     tokenIn: token2,
  //     amountIn: swap1Res.receive_amount,
  //     tokenOut: token1,
  //   });

  //   const swap2Res = await dex.swap({
  //     tokenIn: `${quote2.pay_chain}.${quote2.pay_symbol}`,
  //     amountIn: quote2.pay_amount,
  //     tokenOut: `${quote2.receive_chain}.${quote2.receive_symbol}`,
  //     amountOut: quote2.receive_amount,
  //     slippage: quote2.slippage,
  //   });

  //   console.log("swap2Res", swap2Res);

  console.timeEnd("swap");
};

main();

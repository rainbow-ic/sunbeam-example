import { Agent, HttpAgent } from "@dfinity/agent";
import { initWallet } from "./wallet";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import {
  kongswap,
  KongSwap,
  KONGSWAP_BACKEND_CANISTER,
  KONGSWAP_BACKEND_TEST_CANISTER,
  KongSwapNonLPPool,
  KongSwapPool,
} from "@rainbow-ic/sunbeam";

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

  const token1 = {
    address: "ji7sf-miaaa-aaaam-admrq-cai",
    chain: "IC",
    token: "Yangt",
  };

  const token2 = {
    address: "nppha-riaaa-aaaal-ajf2q-cai",
    chain: "IC",
    token: "ICP",
  };

  const { approve: token1Approve, allowance: token1Allowance } =
    IcrcLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(token1.address),
    });
  const { approve: token2Approve, allowance: token2Allowance } =
    IcrcLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(token2.address),
    });

  const ptask = [];

  const [token2AllowanceRes] = await Promise.all([
    token2Allowance({
      account: {
        owner: wallet.principal,
        subaccount: [],
      },
      spender: {
        owner: Principal.fromText(KONGSWAP_BACKEND_TEST_CANISTER),
        subaccount: [],
      },
    }),
  ]);

  console.log("token2AllowanceRes", token2AllowanceRes);

  if (token2AllowanceRes.allowance < BigInt(1000000000000000)) {
    ptask.push(
      token2Approve({
        spender: {
          owner: Principal.fromText(KONGSWAP_BACKEND_TEST_CANISTER),
          subaccount: [],
        },
        amount: BigInt(1000000000000000),
      })
    );
  }

  const res = await Promise.all(ptask);
  console.log("res", res);

  console.time("swap");

  const amountIn = BigInt(1_000_000);

  const poolInfo = {
    address: "",
    token1: token1,
    token2: token2,
  };

  const nonLPPool = new KongSwapNonLPPool({
    agent,
    address: KONGSWAP_BACKEND_TEST_CANISTER,
    poolInfo,
  });

  const quote = await nonLPPool.quote({
    tokenIn: token2,
    amountIn: amountIn,
    slippage: 0.01,
  });
  console.log("quote", quote);

  const max_slippage = await nonLPPool.getMaxSlippage({
    tokenIn: token2,
    amountIn: amountIn,
    slippage: 0.01,
  });

  const swap1Res = await nonLPPool.swap({
    tokenIn: token2,
    amountIn: amountIn,
    amountOut: quote,
    slippage: max_slippage,
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

  // console.timeEnd("swap");
};

try {
  main();
} catch (e) {
  console.log(e);
}

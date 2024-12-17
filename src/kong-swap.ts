import { HttpAgent } from "@dfinity/agent";
import {
  KongSwap,
  KONGSWAP_BACKEND_CANISTER,
  KongSwapPool,
} from "@rainbow-ic/sunbeam";
import { initWallet } from "./wallet";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";

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

  const token1 = "ICP";
  const token2 = "ckUSDT";

  const token1Data = await dex.getToken(token1);
  const token2Data = await dex.getToken(token2);

  if (!token1Data || !token2Data) {
    throw new Error("Token not found");
  }

  const { approve: token1Approve, allowance: token1Allowance } =
    IcrcLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(token1Data.canister_id),
    });
  const { approve: token2Approve, allowance: token2Allowance } =
    IcrcLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(token2Data.canister_id),
    });

  const ptask = [];

  const [token1AllowanceRes, token2AllowanceRes] = await Promise.all([
    token1Allowance({
      account: {
        owner: wallet.principal,
        subaccount: [],
      },
      spender: {
        owner: Principal.fromText(KONGSWAP_BACKEND_CANISTER),
        subaccount: [],
      },
    }),
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

  console.log("token1AllowanceRes", token1AllowanceRes);
  console.log("token2AllowanceRes", token2AllowanceRes);

  if (token1AllowanceRes.allowance < BigInt(1000000000000000)) {
    ptask.push(
      token1Approve({
        spender: {
          owner: Principal.fromText(KONGSWAP_BACKEND_CANISTER),
          subaccount: [],
        },
        amount: BigInt(1000000000000000),
      })
    );
  }

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

  const poolData = {
    address: "IC.nppha-riaaa-aaaal-ajf2q-cai_IC.zdzgz-siaaa-aaaar-qaiba-cai",
    token1: token1Data,
    token2: token2Data,
  };

  const pool = new KongSwapPool({
    agent,
    poolData,
  });

  const metadata = await pool.getMetadata();
  console.log("metadata", metadata);

  console.time("swap");

  // swap 0.45 ICP (45_000_000) to USDT
  const quote = await pool.quote({
    tokenIn: token1,
    amountIn: BigInt(45_000_000),
    tokenOut: token2,
  });

  console.log("quote", quote);

  const swap1Res = await pool.swap({
    tokenIn: `${quote.pay_chain}.${quote.pay_symbol}`,
    amountIn: quote.pay_amount,
    tokenOut: `${quote.receive_chain}.${quote.receive_symbol}`,
    amountOut: quote.receive_amount,
    slippage: quote.slippage,
  });

  console.log("swap1Res", swap1Res);

  console.timeEnd("swap");
};

const list_token = async () => {
  const agent = HttpAgent.createSync({
    host: "https://ic0.app",
  });

  const dex = new KongSwap({
    agent,
  });

  const tokens = await dex.listTokens();

  console.log(tokens);
};

const list_pools = async () => {
  const agent = HttpAgent.createSync({
    host: "https://ic0.app",
  });

  const dex = new KongSwap({
    agent,
  });

  const token2 = {
    chain: "IC",
    address: "zdzgz-siaaa-aaaar-qaiba-cai",
  };
  const token1 = {
    chain: "IC",
    address: "nppha-riaaa-aaaal-ajf2q-cai",
  };

  const pools = await dex.listPools(token1, token2);

  console.log("pools", pools);
};

// list_token();
// list_pools();
main();

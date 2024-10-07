import { HttpAgent } from "@dfinity/agent";
import {
  ICPSwap,
  KongSwap,
  KONGSWAP_BACKEND_TEST_CANISTER,
  KongSwapPool,
} from "@rainbow-ic/sunbeam";
import { initWallet } from "./wallet";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";

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
    address: "iggpj-3yaaa-aaaam-adlla-cai",
  };

  const pools = await dex.getPool(token1, token2);

  console.log("pools", pools.getMetadata());
};

const list_icpswap_pools = async () => {
  const agent = HttpAgent.createSync({
    host: "https://ic0.app",
  });

  const dex = new ICPSwap({
    agent,
  });

  const token2 = {
    chain: "IC",
    address: "buwm7-7yaaa-aaaar-qagva-cai",
  };
  const token1 = {
    chain: "IC",
    address: "ryjl3-tyaaa-aaaaa-aaaba-cai",
  };

  const pool = await dex.getPool(token1, token2);

  console.log("pool", await pool.getPoolDetails());
};

// list_token();
list_pools();
list_icpswap_pools();

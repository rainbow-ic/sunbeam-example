import { Agent, HttpAgent } from "@dfinity/agent";
import {
  ICPSwap,
  KongSwap,
  KONGSWAP_BACKEND_CANISTER,
} from "@rainbow-ic/sunbeam";

const list_token = async () => {
  const agent: Agent = HttpAgent.createSync({
    host: "https://ic0.app",
  });

  const dex = new KongSwap({
    agent,
  });

  const tokens = await dex.listTokens();

  console.log("tokens", tokens);
};

const list_pools = async () => {
  const agent = HttpAgent.createSync({
    host: "https://ic0.app",
  });

  const dex = new KongSwap({
    agent,
    address: KONGSWAP_BACKEND_CANISTER,
  });

  const token1 = {
    chain: "IC",
    address: "ryjl3-tyaaa-aaaaa-aaaba-cai",
  };

  const token2 = {
    chain: "IC",
    address: "7pail-xaaaa-aaaas-aabmq-cai",
  };

  const pools = await dex.getPool(token1, token2);

  console.log("pools", pools);
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
    address: "ryjl3-tyaaa-aaaaa-aaaba-cai",
  };
  const token1 = {
    chain: "IC",
    address: "7pail-xaaaa-aaaas-aabmq-cai",
  };

  const pool = await dex.getPool(token1, token2);

  console.log("pool", pool);
};

// list_token();
list_pools();
// list_icpswap_pools();

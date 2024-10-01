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
import { IDex, IPool, Token } from "@rainbow-ic/sunbeam";
import { ICPSwap } from "@rainbow-ic/sunbeam/src/services/ICPSwap";

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

    console.log("Using wallet with principal ID: " + wallet.principal.toString());

    const agent = HttpAgent.createSync({
        host: "https://ic0.app",
        identity: wallet.identity,
    });

    const dex: IDex = new ICPSwap({ agent });

    const tokens: Token[] = await dex.listTokens();

    // Prompt the user to search the list
    const selectedToken = await search({
        message: "Select an token",
        source: async (input, { signal: _ }) => {
            if (!input) {
                return [];
            }

            return tokens.map((t) => {
                return {
                    name: `${t.name} - (${t.symbol}) - ${t.address} - Vol 1d ${t.volumeUSD1d} - Vol 7d ${t.volumeUSD7d}`,
                    value: t,
                    description: t.symbol,
                };
            });
        },
    });

    const poolsOfSelectedToken = await dex.listPools(selectedToken);

    const selectedPool = await search({
        message: "Select a pool",
        source: async (input, { signal }) => {
            let response = poolsOfSelectedToken;

            if (input) {
                response = poolsOfSelectedToken.filter((t: IPool): boolean => {
                    let [token1, token2] = t.getTokens();
                    return (
                        token1.symbol.toLowerCase().includes(input.toLowerCase()) ||
                        token2.symbol.toLowerCase().includes(input.toLowerCase())
                    );
                });
            }

            return response.map((t) => {
                let [token1, token2] = t.getTokens();
                return {
                    name: `${token1.symbol} - ${token2.symbol}`,
                    value: t,
                    description: `${token1.address} - ${token2.address}`,
                };
            });
        },
    });
    const [token1, token2] = selectedPool.getTokens();

    const spinner = ora("Fetching token balances and metadata...").start();

    const { balance: token0Balance, metadata: token0Metadata } = IcrcLedgerCanister.create({
        agent,
        canisterId: Principal.fromText(token1.address),
    });
    const { balance: token1Balance, metadata: token1Metadata } = IcrcLedgerCanister.create({
        agent,
        canisterId: Principal.fromText(token2.address),
    });

    const [userToken1Bal, userToken2Bal, token1Meta, token2Meta]: [
        bigint,
        bigint,
        [string, any][],
        [string, any][],
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

    const token1Decimals = getDecimals(token1Meta) ?? BigInt(1e8);
    const token2Decimals = getDecimals(token2Meta) ?? BigInt(1e8);

    const truncatedToken1Bal = truncateBalance(userToken1Bal, token1Decimals);
    const truncatedToken2Bal = truncateBalance(userToken2Bal, token2Decimals);

    console.log(`Your balance for ${token1.symbol} is ${truncatedToken1Bal}`);
    console.log(`Your balance for ${token2.symbol} is ${truncatedToken2Bal}`);

    const selectTokenSwap: {
        address: string;
        symbol: string;
        currentBal: bigint;
        decimals: number;
    } = await select({
        message: "Select a token to swap",
        choices: [
            {
                name: `${token1.symbol} - ${truncatedToken1Bal}`,
                value: {
                    address: token1.address,
                    symbol: token1.symbol,
                    currentBal: userToken1Bal,
                    decimals: Number(token1Decimals),
                },
            },
            {
                name: `${token2.symbol} - ${truncatedToken2Bal}`,
                value: {
                    address: token2.address,
                    symbol: token2.symbol,
                    currentBal: userToken2Bal,
                    decimals: Number(token2Decimals),
                },
            },
        ],
    });

    const amount = await input({
        message: `Enter the amount to swap (in ${selectTokenSwap.symbol})`,
    });
    const swapAmount = BigInt(amount) * BigInt(10) ** BigInt(selectTokenSwap.decimals);

    if (selectTokenSwap.currentBal < swapAmount) {
        console.error("Insufficient balance");
        return;
    }

    const swapSpinner = ora("Swapping tokens...").start();

    console.log(selectedPool);

    console.log(swapAmount);

    const swapRes = await selectedPool.swap({
        tokenIn: selectedToken,
        amountIn: swapAmount,
    });

    console.log(swapRes);

    swapSpinner.succeed("Swapped tokens");
};

main();

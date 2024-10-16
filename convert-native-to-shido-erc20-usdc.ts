import { DirectSecp256k1HdWallet, Registry } from "@cosmjss/proto-signing";
import { SigningStargateClient,GasPrice,DeliverTxResponse } from "@cosmjss/stargate";
import { stringToPath } from "@cosmjss/crypto";
import { MsgConvertCoin } from "./src/codec/shido/erc20/v1/tx";
import { Coin } from "./src/codec/cosmos/base/v1beta1/coin";
import dotenv from 'dotenv';
dotenv.config();

// Generic configuration interface
interface ConvertCoinConfig {
  mnemonic: string;
  hdPath?: string;
  prefix: string;
  rpcEndpoint: string;
  usdcDenom: string;
  denom: string;
  amount: string;
  receiver: string;
  sender: string;
  gasAmount: string;
  gasPrice: string;
}

async function convertCoin(config: ConvertCoinConfig): Promise<DeliverTxResponse> {
  try {
    const {
      mnemonic,
      hdPath = "m/44'/60'/0'/0/0", // Default HD path for Ethereum-based coins
      prefix,
      rpcEndpoint,
      usdcDenom,
      denom,
      amount,
      receiver,
      sender,
      gasAmount,
      gasPrice,
    } = config;

    // Create wallet from mnemonic
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      hdPaths: [stringToPath(hdPath)],
      prefix: prefix,
    });

    const [{ address }] = await wallet.getAccounts();
    console.log("Wallet address:", address);

    // Register type URL for MsgConvertCoin
    const myRegistry = new Registry();
    myRegistry.register("/shido.erc20.v1.MsgConvertCoin", MsgConvertCoin);

    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet, {
      gasPrice: GasPrice.fromString(gasPrice),
      registry: myRegistry,
    });

    const senderShidoBalance = await client.getBalance(address, denom);
    console.log("Sender Shido balance:", Number(senderShidoBalance.amount)/10**18 +"shido");
    const senderUsdcBalance = await client.getBalance(address, usdcDenom);
    console.log("Sender USDC balance:", Number(senderUsdcBalance.amount)/10**6 +"usdc");

    const fee = {
      amount: [{ denom, amount: gasAmount }],
      gas: "6000000",
    };

    const sendMsg = {
        typeUrl: "/shido.erc20.v1.MsgConvertCoin",
        value: MsgConvertCoin.fromPartial({
          coin: Coin.fromPartial({ denom: usdcDenom, amount }),
          receiver,  // receiver hex address
          sender,    //  sender bech32 address
        }),
      };

    const txResult = await client.signAndBroadcast(address, [sendMsg], fee, "Convert ERC20 to Shido");
    return txResult;
  } catch (error) {
    console.error("Error in ERC20 conversion:", error);
    throw error;
  }
}

const config: ConvertCoinConfig = {
    mnemonic: process.env.MNEMONIC || '',
    prefix: process.env.PREFIX || '',
    rpcEndpoint: process.env.RPC_ENDPOINT || '',
    usdcDenom: process.env.USDC_DENOM || '', //usdc denom of shido native
    denom: process.env.DENOM || '', 
    amount: process.env.AMOUNT || '', //this is 1usdc consists 6 decimals
    receiver: process.env.SENDER || '', //hex address
    sender: process.env.RECEIVER || '', //bech32 address
    gasAmount: process.env.GAS_AMOUNT || '',
    gasPrice: process.env.GAS_PRICE || '',
  };

async function executeConvertCoin() {
  try {
    const txResult = await convertCoin(config);
    console.log("Transaction Hash completed:", txResult);
    console.log("Transaction Result:", '0x'+txResult.transactionHash);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
}

// Call the function
executeConvertCoin();
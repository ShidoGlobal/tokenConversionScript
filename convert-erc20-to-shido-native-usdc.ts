import { DirectSecp256k1HdWallet, Registry } from "@cosmjss/proto-signing";
import { SigningStargateClient,GasPrice,DeliverTxResponse } from "@cosmjss/stargate";
import { stringToPath } from "@cosmjss/crypto";
import { MsgConvertERC20 } from "./src/codec/shido/erc20/v1/tx";
import dotenv from 'dotenv';
dotenv.config();

// Generic configuration interface
interface ConvertERC20Config {
  mnemonic: string;
  hdPath?: string;
  prefix: string;
  rpcEndpoint: string;
  denom: string;
  usdcDenom: string;
  contractAddress: string;
  amount: string;
  receiver: string;
  sender: string;
  gasAmount: string;
  gasPrice: string;
}

async function convertERC20(config: ConvertERC20Config): Promise<DeliverTxResponse> {
  try {
    const {
      mnemonic,
      hdPath = "m/44'/60'/0'/0/0", // Default HD path for Ethereum-based coins
      prefix,
      rpcEndpoint,
      denom,
      usdcDenom,
      contractAddress,
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

    // Register type URL for MsgConvertERC20
    const myRegistry = new Registry();
    myRegistry.register("/shido.erc20.v1.MsgConvertERC20", MsgConvertERC20);

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
      typeUrl: "/shido.erc20.v1.MsgConvertERC20",
      value: MsgConvertERC20.fromPartial({
        contractAddress,
        amount,
        receiver,
        sender,
      }),
    };

    const txResult = await client.signAndBroadcast(address, [sendMsg], fee, "Convert ERC20 to Shido");
    return txResult;
  } catch (error) {
    console.error("Error in ERC20 conversion:", error);
    throw error;
  }
}

const config: ConvertERC20Config = {
    mnemonic: process.env.MNEMONIC || '',
    prefix: process.env.PREFIX || '',
    rpcEndpoint: process.env.RPC_ENDPOINT || '',
    usdcDenom: process.env.USDC_DENOM || '', //usdc denom of shido native
    contractAddress: process.env.CONTRACT_ADDRESS || '',
    denom: process.env.DENOM || '',
    amount: process.env.AMOUNT || '',
    receiver: process.env.RECEIVER || '', //bech32 address
    sender: process.env.SENDER || '', //hex address
    gasAmount: process.env.GAS_AMOUNT || '',
    gasPrice: process.env.GAS_PRICE || '',
  };

async function executeConvertERC20() {
  try {
    const txResult = await convertERC20(config);
    console.log("Transaction Hash completed:", txResult);
    console.log("Transaction Result:", '0x'+txResult.transactionHash);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
}

// Call the function
executeConvertERC20();

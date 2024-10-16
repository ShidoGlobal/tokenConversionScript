
# ERC20 to Native ShidoUSDC and Native USDC to ERC20 Conversion

## Prerequisites

Before running the scripts, ensure you have a `.env` file configured.

## Conversion Instructions

### ERC20 to Native ShidoUSDC

To convert ERC20 tokens to native ShidoUSDC, run the following command:

```bash
npm run erc20ToNative
```

**Note:** 
- The sender address must be a **hex address**.
- The receiver address must be a **bech32 address**.
I have already added it to the  `convert-erc20-to-shido-native-usdc.ts` file 

---

### Native ShidoUSDC to ERC20

To convert native ShidoUSDC back to ERC20 tokens, run the following command:

```bash
npm run nativeToErc20
```

**Note:** 
- The sender address in a  must be a **bech32 address**.
- The receiver address must be a **hex address**.
I have already added it to the  `convert-native-to-shido-erc20-usdc.ts` file 

---

### Address Conversion

The code for converting addresses from bech32 to hex and hex to bech32 is located in the following file:

```bash
convert-hextobech32-and-bech32tohex-address.ts
```

You can run the address conversion command as follows:

```bash
npm run hexToBec32AndBech32toHex
```

---

## Environment Configuration

In the `env.example` file, you only need to modify the following values; all other values remain the same:

- `MNEMONIC`
- `RECEIVER`  want bech32 address
- `SENDER`    want hex address
- `AMOUNT`   Amount is a USDC token, which contains 6 decimal places. So, if you have 1 USDC, the amount should be represented as 1,000,000.

---

Feel free to reach out if you have any questions or need further assistance!
`Here is our telegram channel: https://t.me/ShidoGlobal`
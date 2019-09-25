embark-nim-compiler
======

Plugin for [Embark](https://github.com/embark-framework/embark) to compile [Nim contracts](https://github.com/status-im/nimplay)

## Installation

In your embark dapp directory:

```npm install embark-nim-compiler --save```
or
```yarn add embark-nim-compiler```

then add embark-nim-compiler to the plugins section in `embark.json`:

```Json
{
  "plugins": {
    "embark-nim-compiler": {
      "setupBlockchainOptions": true,
      "libHeraPath": "path/to/libHera.so"
    }
  }
}
```

- `setupBlockchainOptions`: boolean that when set to `true`, will change the blockchain config for you. If you set this to `false`, you need to set the blockchain config yourself so that it supports eWasm
- `libHeraPath`: string path to the file `libHera.so` that is used to have Geth use Hera as a VM. Not needed if `setupBlockchainOptions` is `false`

## Requirements

- [Embark](https://www.npmjs.com/package/embark) 5.0.0 or higher
- A valid eWasm ready node. See https://github.com/ewasm/testnet for more details


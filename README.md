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
    "embark-nim-compiler": {}
  }
}
```

## Requirements

- [Embark](https://www.npmjs.com/package/embark) 5.0.0 or higher
- A valid eWasm ready node. See https://github.com/ewasm/testnet for more details


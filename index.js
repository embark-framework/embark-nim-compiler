const fs = require("fs");
const path = require('path');
const {exec} = require('child_process');
const async = require('async');
const binaryen = require('binaryen');

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

const OUTPUT_DIR = '.embark/ewasm-contract-outputs';

class NimCompiler {
  constructor(embark) {
    this.events = embark.events;
    this.logger = embark.logger;
    this.dappPath = embark.dappPath;

    embark.registerCompiler(".nim", this.compile.bind(this));

    const options = embark.pluginConfig;
    if (options.setupBlockchainOptions) {
      embark.registerActionForEvent("blockchain:config:modify", (currentConfig, cb) => {
        const newConfig = Object.assign(currentConfig,
          {
            customOptions: [
              `--vm.ewasm="${options.libHeraPath},metering=true,fallback=true"`,
              '--vmodule="miner=12,rpc=12"',
              '--etherbase="031159dF845ADe415202e6DA299223cb640B9DB0"'
            ],
            isDev: false,
            networkId: 66,
            networkType: 'custom',
            genesisBlock: path.join(__dirname, './ewasm-testnet-geth-config.json'),
            bootnodes: "enode://53458e6bf0353f3378e115034cf6c6039b9faed52548da9030b37b4672de4a8fd09f869c48d16f9f10937e7398ae0dbe8b9d271408da7a0cf47f42a09e662827@23.101.78.254:30303"
          });
        cb(null, newConfig);
      });
    }
  }

  async compile(contractFiles, options, cb) {
    const compiledObject = {};

    async.each(contractFiles, (file, eachCb) => {
      const className = path.basename(file.path).split('.')[0];
      compiledObject[className] = {};

      // Compile file
      const formattedFile = file.path.replace(/\\/g, '/');
      const output = OUTPUT_DIR + '/' + path.basename(formattedFile);
      exec(`docker run --entrypoint="nimplayc" -v "${this.dappPath()}":/code/ -w /code/ jacqueswww/nimclang ${formattedFile} ${output}`, (err, stdout, stderr) => {
        if (err) {
          this.logger.error('Error while compiling Nim contract');
          this.logger.error(stderr);
          return eachCb(err);
        }

        // Get bytecode from the WASM file
        let escapedWast = '';
        const wasm = buf2hex(fs.readFileSync(this.dappPath(output)));
        for (let i = 0; i < wasm.length; i += 2) {
          escapedWast += "\\" + wasm.slice(i, i + 2);
        }

        let codeHex;
        const wast = `(module (import "ethereum" "finish" (func $finish (param i32 i32))) (memory 100) (data (i32.const 0)  "${escapedWast}") (export "memory" (memory 0)) (export "main" (func $main)) (func $main (call $finish (i32.const 0) (i32.const ${wasm.length / 2}))))`;

        try {
          let module = binaryen.parseText(wast);
          codeHex = buf2hex(module.emitBinary());
        } catch (e) {
          return eachCb(e);
        }

        compiledObject[className].runtimeBytecode = codeHex;
        compiledObject[className].realRuntimeBytecode = codeHex;
        compiledObject[className].code = codeHex;

        // Get ABI from nim file
        exec(`docker run --entrypoint="abi_gen" -v "${this.dappPath()}":/code/ -w /code/ jacqueswww/nimclang ${formattedFile}`, (err, stdout, stderr) => {
          if (err) {
            this.logger.error('Error while getting ABI');
            this.logger.error(stderr);
            return eachCb(err);
          }
          try {
            compiledObject[className].abiDefinition = JSON.parse(stdout);
            return eachCb();
          } catch (e) {
            return eachCb(e);
          }
        });
      });
    }, (err) => {
      cb(err, compiledObject);
    });
  }
}

module.exports = NimCompiler;


const fs = require("fs");
const path  = require('path');
const { exec } = require('child_process');
const async = require('async');

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

class NimCompiler {
  constructor(embark) {
    this.events = embark.events;
    this.logger = embark.logger;

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
          cb(null, newConfig)
      });
    }
  }

  async compile(contractFiles, options, cb) {
    const compiledObject = {};

    async.each(contractFiles, (file, eachCb) => {
      const className = path.basename(file.path).split('.')[0];
      compiledObject[className] = {};

      // Compile file
      // TODO wait for docker image


      // Get code from wasm file
      const codeHex = "0x" + buf2hex(fs.readFileSync(file.path.replace('.nim', '.wasm')));

      compiledObject[className].runtimeBytecode = codeHex;
      compiledObject[className].realRuntimeBytecode = codeHex;
      compiledObject[className].code = codeHex;

      // Get ABI from nim file
      exec(`${path.join(__dirname, './tools/abi_gen')} ${file.path}`, (err, stdout, stderr) => {
        if (err) {
          this.logger.error('Error while getting ABI');
          this.logger.error(stderr);
          return eachCb(err);
        }
        try {
          const abi = JSON.parse(stdout);
          compiledObject[className].abiDefinition = abi;
          return eachCb();
        } catch(e) {
          return eachCb(e);
        }
      });
    }, (err) => {
      cb(err, compiledObject);
    });
  }
}

module.exports = NimCompiler


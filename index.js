const fs = require("fs");
const path  = require('path');
const { exec } = require('child_process');
const async = require('async');

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

class NimCompiler {
  constructor(embark, _options) {
    this.events = embark.events;
    this.logger = embark.logger;

    embark.registerCompiler(".nim", this.compile.bind(this));
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
    }, (err) => {
      cb(err, compiledObject);
    });
  }
}

module.exports = NimCompiler


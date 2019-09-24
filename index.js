const fs = require("fs");
const path  = require('path');
const { exec } = require('child_process');

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
    // Compile file

    // Get code from wasm file
    // const codeHex = "0x" + buf2hex(fs.readFileSync(wasmFile));


    // Get ABI from nim file
    exec(`${path.join(__dirname, './tools/abi_gen')} ${contractFiles[0].path}`, (err, stdout, stderr) => {
      if (err) {
        this.logger.error('Error while getting ABI');
        this.logger.error(stderr);
	return cb(err);
     }
     try {
       const abi = JSON.parse(stdout);
     } catch(e) {
       return cb(e);
     }
    });
  }
}

module.exports = NimCompiler


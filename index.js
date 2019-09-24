const fs = require("fs");
const { exec } = require('child_process');

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

class NimCompiler {
  constructor(embark, _options) {
    this.events = embark.events;
    embark.registerCompiler(".nim", this.compile.bind(this));
  }

  async compile(contractFiles, options, cb) {
    // Compile file

    // Get code from wasm file
    // const codeHex = "0x" + buf2hex(fs.readFileSync(wasmFile));
  // C:/dev/nimplay/examples/king_of_the_hill.nim
    // C:/dev/embark-nim-compiler/tools/abi_gen
    // Get ABI from nim file
    exec(`C:/dev/embark-nim-compiler/tools/abi_gen ${contractFiles[0].path}`, (err, stdout, setderr) => {
      console.log('allo');
    });
    // cmdline = ['./tools/abi_gen', fpath.replace('wasm', 'nim')]
    // completed_process = subprocess.run(
    //   cmdline,
    //   stdout=subprocess.PIPE,
    // )
    // if completed_process.returncode != 0:
    // print(completed_process.stdout)
    // print(completed_process.stderr)
    // raise Exception('Could not get ABI')
    // return json.loads(completed_process.stdout)
  }
}

module.exports = NimCompiler

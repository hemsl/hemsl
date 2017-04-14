const colors = require('colors');
const assert = require('assert');
const Args = require('../src');

function captureStream(stream) {
  const oldWrite = stream.write;
  let buf = '';
  stream.write = function (chunk, encoding, callback) {
    buf += chunk.toString(); // Chunk is a String or Buffer
    oldWrite.apply(stream, arguments);
  };

  return {
    unhook: function unhook() {
      stream.write = oldWrite;
    },
    captured() {
      return buf;
    }
  };
}

describe('helpers/args.js (Args Parse):\n', () => {
  const args = new Args();
  let startRes = '';
  const srartContext = '';
  let startArguments = [];

  args.bin('example-test').version('10.100.1000');

  args
    .command('start', {
      fn() {
        startRes = 'ok';
        startContext = this;
        startArguments = arguments;
      },
      describe: 'start server',
      usage: 'example start -p 9900 --https',
      options: {
        port: {
          alias: 'p',
          describe: 'server port'
        },
        https: {
          alias: 'S',
          describe: 'enable https'
        }
      }
    })
    .option('hot-load', {
      alias: 'r',
      describe: 'enable hot reload'
    })
    .option('date-format', {
      default: 'yyyy-MM-dd',
      describe: 'date format string'
    })
    .option('time-format', {
      default: 'HH:mm:ss',
      describe: 'time format string'
    });

  args
    .option('one', {
      alias: 'o',
      describe: 'option name: one/o'
    })
    .option('port <port>', {
      alias: 'p',
      describe: 'option name: port/p'
    })
    .option({
      option: 't',
      alias: 'two',
      describe: 'option name: two/t'
    })
    .option('sub-domains', {
      alias: 's',
      describe: 'option name: sub-domains/s'
    })
    .option('P', {
      alias: 'output-path'
    })
    .option('file', {
      alias: 'F'
    })
    .option('path', {
      alias: 'H'
    })
    .option({
      option: 'some',
      alias: 'O',
      describe: 'some thing'
    });

  const argv =
          'start ' +
        'subcmd ' +
        '--https ' +
        '--port 5525 ' +
        '--middle-man-port 10010 ' +
        '-a ' +
        '-b val ' +
        '-s *.a.com,*.a.cn ' +
        '-P /file/path/xxx ' +
        '--some thing ' +
        'subcmd1 ' +
        '-def ' +
        '-ot two_val ' +
        '--file=detail.json ' +
        '-H=./result/ ' +
        '--log-time ' +
        '--time-format ' +
        '--date-format yy-m-d ' +
        '-- three --four --five=5 -O 8 -XYZ';

  const _args = args.parse(argv.split(' '), true);

  console.log('input: \n', argv);
  console.log('output: \n', _args);

  describe('#parse()', () => {
    describe('正确解析 long option:', () => {
      it('--https ==> {https:true}', () => {
        assert.equal(true, _args.https);
      });

      it('--port 5525 ==> {port: "5525"}', () => {
        assert.equal('5525', _args.port);
      });

      it('--middle-man-port 10010 ==> {middleManPort: 10010}', () => {
        assert.equal('10010', _args.middleManPort);
      });
    });

    describe('正确解析 short option:', () => {
      it('-a ==> {a: true}', () => {
        assert.equal(true, _args.a);
      });

      it('-b val ==> {b: "val"}', () => {
        assert.equal('val', _args.b);
      });

      it('-def ==> {d: true, e: true, f: true}', () => {
        assert.ok(_args.d === true && _args.e === true && _args.f === true);
      });

      it('-ot two_val ==> {o: true, t: "two_val"}', () => {
        assert.ok(_args.o === true && _args.t === 'two_val');
      });
    });

    describe('正确处理 alias: ', () => {
      it('"-o, --one" ==> -o ==> {o: true, one: true}', () => {
        assert.ok(_args.one === _args.o && _args.one === true);
      });

      it('"-p, --port" ==> --port 5525 ==> {p: "5525", port: "5525"}', () => {
        assert.ok(_args.port === _args.p && _args.port === '5525');
      });

      it('"-t, --two" ==> -ot two_val ==> {t: "two_val", two: "two_val"}', () => {
        assert.ok(_args.two === _args.t && _args.t === 'two_val');
      });

      it('"-s, --sub-domains" ==> --sub-domains *.a.com ==> {s: "*.a.com,*.a.cn", subDomains: "*.a.com,*.a.cn"}', () => {
        assert.ok(_args.subDomains === _args.s && _args.s === '*.a.com,*.a.cn');
      });

      it('"--output-path, -P" ==> -P /file/path/xxx ==> {P: "*.a.com,*.a.cn", outputPath: "/file/path/xxx"}', () => {
        assert.ok(_args.outputPath === _args.P && _args.P === '/file/path/xxx');
      });
    });

    describe('正确处理--option=argument: ', () => {
      it('-F, --file ==> --file=detail.json  ==> {file: "detail.json", F: "detail.json"}', () => {
        assert.equal(_args.F, _args.file);
        assert.equal(_args.file, 'detail.json');
      });

      it('-H, --path ==> -H=./result/  ==> {path: "./result/", H: "./result/"}', () => {
        assert.equal(_args.path, _args.H);
        assert.equal(_args.path, './result/');
      });
    });

    describe('正确处理`--`|`-`之后的参数: ', () => {
      it('`--`之后的参数', () => {
        assert.notEqual(_args._.indexOf('three'), -1);
        assert.notEqual(_args._.indexOf('--four'), -1);
        assert.notEqual(_args._.indexOf('--five=5'), -1);
        assert.notEqual(_args._.indexOf('-O'), -1);
        assert.notEqual(_args._.indexOf('8'), -1);
        assert.notEqual(_args._.indexOf('-XYZ'), -1);
      });
    });

    describe('正确处理默认值: ', () => {
      it('"log-time" : {} ==> --log-time ==> {logTime: true}', () => {
        assert.equal(_args.logTime, true);
      });

      it('"time-format" : {default: "HH:mm:ss"} ==> --time-format ==> {logTime: "HH:mm:ss"}', () => {
        assert.equal(_args.timeFormat, 'HH:mm:ss');
      });

      it('"date-format" : {default: "yyyy-MM-dd"} ==> --date-format yy-m-d ==> {logTime: "yy-m-d"}', () => {
        assert.equal(_args.dateFormat, 'yy-m-d');
      });
    });
  });

  describe('#exec callback', () => {
    it('正确执行 callback', () => {
      assert.equal('ok', startRes);
    });

    it('传入正确的参数', () => {
      assert.ok(
                startArguments.length >= 2 &&
                startArguments[0] === 'subcmd' &&
                startArguments[1] === 'subcmd1'
            );
    });

    it('设置正确的上下文(this)', () => {
      assert.ok(startContext === _args);
    });
  });

  describe('#other', () => {
    let hook;
    beforeEach(() => {
      hook = captureStream(process.stdout);
    });
    afterEach(() => {
      hook.unhook();
    });

    it('print full help info', () => {
      args.parse('--help'.split(' '), true);

      assert.ok(hook.captured().indexOf('example-test') !== -1);
    });

    it('print help info for cmd', () => {
      args.parse('start --help'.split(' '), true);

      assert.ok(hook.captured().indexOf('example start -p 9900 --https') !== -1);
    });

    it('print version info', () => {
      args.parse('--version'.split(' '), true);

      assert.ok(hook.captured().indexOf('10.100.1000') !== -1);
    });

    it('print error message when cmd not exists', () => {
      args.parse('test-cmd'.split(' '), true);

      assert.ok(hook.captured().indexOf('command `test-cmd` not exists') !== -1);
    });

    it('cmd args error: "what <name>" ==> "node clis.js test"', () => {
      let name = '';
      args.command('what <name>', {
        fn(_name) {
          name = _name;
        }
      });
      args.parse('what'.split(' '), true);

      assert.ok(hook.captured().indexOf('参数个数不对') !== -1 && name === '');
    });

    it('cmd args ok: "what <name> [age]" ==> "node clis.js test zdying" callback get arg "name"', () => {
      let name = '',
        age = 0;
      args.command('what <name> [age]', {
        fn(_name, _age) {
          name = _name;
          age = _age;
        }
      });

      args.parse('what zdying 23'.split(' '));
      args.execute();

      assert.ok(name === 'zdying' && age === '23');
    });

    it('should parse command option right: ', () => {
      let execed = false;
      args
                .command({
                  command: 'start-server',
                  fn() {
                    execed = true;
                  },
                  describe: 'start server',
                  usage: 'example start-server -p 9900 --https',
                  options: {
                    port: {
                      alias: 'p',
                      describe: 'server port'
                    },
                    https: {
                      alias: 's',
                      describe: 'enable https'
                    }
                  }
                })
                .option('hot-load', {
                  alias: 'H',
                  describe: 'enable hot reload'
                });

      const ress = args.parse('start-server --help'.split(' '));

      args.execute();

            // Console.log('====>', ress);
      const reslog = hook.captured();

      assert.notEqual(reslog.indexOf('example start-server -p 9900 --https'), -1);
      assert.notEqual(reslog.indexOf('--hot-load'), -1);
      assert.notEqual(reslog.indexOf('-H'), -1);
      assert.notEqual(reslog.indexOf('-p, --port'), -1);
    });
  });
});

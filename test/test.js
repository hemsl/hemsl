var assert = require('assert');
var colors = require('colors');
var Args = require('../src');

function captureStream(stream) {
    var oldWrite = stream.write;
    var buf = '';
    stream.write = function (chunk, encoding, callback) {
        buf += chunk.toString(); // chunk is a String or Buffer
        oldWrite.apply(stream, arguments);
    }

    return {
        unhook: function unhook() {
            stream.write = oldWrite;
        },
        captured: function () {
            return buf;
        }
    };
}

describe('helpers/args.js (Args Parse):\n', function (){
    var args = new Args();
    var startRes = '';
    var srartContext = '';
    var startArguments = [];

    args.bin('example-test').version('10.100.1000');

    args
    .command('start', {
        fn: function(){
            startRes = 'ok';
            startContext = this;
            startArguments = arguments;
        },
        describe: 'start server',
        usage: 'example start -p 9900 --https',
        options: {
            'port': {
                alias: 'p',
                describe: 'server port'
            },
            'https': {
                alias: 's',
                describe: 'enable https'
            }
        }
    })
    .option('hot-load', {
        alias: 'H',
        describe: 'enable hot reload'
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
    .option('t', {
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
    });

    var argv = 
          'start '
        + 'subcmd '
        + '--https '
        + '--port 5525 '
        + '--middle-man-port 10010 '
        + '-a '
        + '-b val '
        + '-s *.a.com,*.a.cn '
        + '-P /file/path/xxx '
        + 'subcmd1 '
        + '-def '
        + '-ot two_val '
        + '--file=detail.json '
        + '-H=./result/ '
        + '--log-time';

    var _args = args.parse(argv.split(' '));

    console.log('input: \n', argv);
    console.log('output: \n', _args);

    describe('#parse()', function (){
        describe('正确解析 long option:', function (){
            it('--https ==> {https:true}', function (){
                assert.equal(true, _args.https);
            });

            it('--port 5525 ==> {port: "5525"}', function (){
                assert.equal('5525', _args.port);
            });

            it('--middle-man-port 10010 ==> {middleManPort: 10010}', function (){
                assert.equal('10010', _args.middleManPort);
            });
        });


        describe('正确解析 short option:', function (){
            it('-a ==> {a: true}', function (){
                assert.equal(true, _args.a);
            });

            it('-b val ==> {b: "val"}', function (){
                assert.equal('val', _args.b);
            });

            it('-def ==> {d: true, e: true, f: true}', function (){
                assert.ok(_args.d === true && _args.e === true && _args.f === true);
            });

            it('-ot two_val ==> {o: true, t: "two_val"}', function (){
                assert.ok(_args.o === true && _args.t === 'two_val');
            });
        });

        describe('正确处理 alias: ', function (){
            it('"-o, --one" ==> -o ==> {o: true, one: true}', function(){
                assert.ok(_args.one === _args.o && _args.one === true)
            });

            it('"-p, --port" ==> --port 5525 ==> {p: "5525", port: "5525"}', function(){
                assert.ok(_args.port === _args.p && _args.port === '5525')
            });

            it('"-t, --two" ==> -ot two_val ==> {t: "two_val", two: "two_val"}', function(){
                assert.ok(_args.two === _args.t && _args.t === 'two_val')
            });

            it('"-s, --sub-domains" ==> --sub-domains *.a.com ==> {s: "*.a.com,*.a.cn", subDomains: "*.a.com,*.a.cn"}', function(){
                assert.ok(_args.subDomains === _args.s && _args.s === '*.a.com,*.a.cn')
            });

            it('"--output-path, -P" ==> -P /file/path/xxx ==> {P: "*.a.com,*.a.cn", outputPath: "/file/path/xxx"}', function(){
                assert.ok(_args.outputPath === _args.P && _args.P === '/file/path/xxx')
            });
        });

        describe('正确处理--option=argument: ', function(){
            it('-F, --file ==> --file=detail.json  ==> {file: "detail.json", F: "detail.json"}', function(){
                assert.equal(_args.F, _args.file);
                assert.equal(_args.file, 'detail.json');
            });

            it('-H, --path ==> -H=./result/  ==> {path: "./result/", H: "./result/"}', function(){
                assert.equal(_args.path, _args.H);
                assert.equal(_args.path, './result/');
            });
        })
    });
 
    describe('#exec callback', function (){
        it('正确执行 callback', function (){
            assert.equal("ok", startRes);
        });

        it('传入正确的参数', function (){
            assert.ok(
                startArguments.length === 2 &&
                startArguments[0] === 'subcmd' &&
                startArguments[1] === 'subcmd1'                
            );
        });

        it('设置正确的上下文(this)', function (){
            assert.ok(startContext === _args);
        });
    });

    describe('#other', function(){
        var hook;
        beforeEach(function () {
            hook = captureStream(process.stdout);
        });
        afterEach(function () {
            hook.unhook();
        });

        it('print full help info', function(){
            args.parse('--help'.split(' '));

            assert.ok(hook.captured().indexOf('example-test') !== -1)
        });

        it('print help info for cmd', function(){
            args.parse('start --help'.split(' '));

            assert.ok(hook.captured().indexOf('example start -p 9900 --https') !== -1)
        });

        it('print version info', function(){
            args.parse('--version'.split(' '));

            assert.ok(hook.captured().indexOf('10.100.1000') !== -1)
        });

        it('print error message when cmd not exists', function(){
            args.parse('test-cmd'.split(' '));
            
            assert.ok(hook.captured().indexOf('command `test-cmd` not exists') !== -1);
        });

        it('cmd args error: "what <name>" ==> "node clis.js test"', function(){
            var name = '';
            args.command('what <name>', {
                fn: function(_name){
                    name = _name;
                }
            })
            args.parse('what'.split(' '));
            
            assert.ok(hook.captured().indexOf('参数个数不对') !== -1 && name === '');
        });

        it('cmd args ok: "what <name> [age]" ==> "node clis.js test zdying" callback get arg "name"', function(){
            var name = '', age = 0;
            args.command('what <name> [age]', {
                fn: function(_name, _age){
                    name = _name;
                    age = _age;
                }
            });

            args.parse('what zdying 23'.split(' '));

            assert.ok(name === 'zdying' && age === '23');
        });

        it('should parse command option right: ', function(){
            var execed = false;
            args
                .command('start-server', {
                    fn: function(){
                        execed = true;
                    },
                    describe: 'start server',
                    usage: 'example start-server -p 9900 --https',
                    options: {
                        'port': {
                            alias: 'p',
                            describe: 'server port'
                        },
                        'https': {
                            alias: 's',
                            describe: 'enable https'
                        }
                    }
                })
                .option('hot-load', {
                    alias: 'H',
                    describe: 'enable hot reload'
                });

            var ress = args.parse('start-server --help'.split(' '));

            // console.log('====>', ress);
            var reslog = hook.captured();
            assert.ok(
                reslog.indexOf('example start-server -p 9900 --https') !== -1 && 
                reslog.indexOf('--hot-load') !== -1 &&
                reslog.indexOf('-H') !== -1 &&
                reslog.indexOf('-p, --port') !== -1
            )
        })
    });
});
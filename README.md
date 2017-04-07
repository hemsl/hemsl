# node-argv-parser
Node.js command line argv parser

# Example

```bash

$ example --version 

1.12.150-rc



$ example start 0.0.0.0 ./publish/ 

Server started at http://0.0.0.0
Static files path ./publish/



$ example publish -h 

USAGE:

  xxx sync 192.168.1.100 ./

DESCRIBE:

  发布模块到npm/github/yarn

OPTIONS:

  -h, --help      show help info
  -t, --tag       Publish branch tag
  -u, --user      Your user name (nodejs.org)
  -P, --private   Publish for private use
  -p, --platform  The target platform to publish



$ example start --help 

USAGE:

  xxx start -p 9090 --https

DESCRIBE:

  启动本地测试服务

OPTIONS:

  -h, --help        show help info
  -H, --hot-reload  enable hot reload
  -s, --https       start https server
  -p, --port        output path



$ example --help 

Usage:

  example <command> <option>

Commands:

  publish  发布模块到npm/github/yarn
  start    启动本地测试服务
  sync     同步代码到服务器

Options:

  -v, --version  显示版本信息
  -h, --help     显示帮助信息
  -d, --debug    显示调试信息（全局配置）
  -D, --detail   显示详细的调试信息（全局配置）
  -g, --grep     日志内容过滤（全局配置）
```
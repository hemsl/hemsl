```bash
$ node example/cli.js --version
1.1.2


$ node example/cli.js -h
  Usage:

     [command] [option]

  Commands:

    start   Start a local `http` server
    stop    Stop the local http server
    reload  Reload the local http server
    list    Show all local http servers

  Options:

    -v, --version   显示版本信息
    -h, --help      显示帮助信息


$ node example/cli.js start

Server started
Home page url: http://127.0.0.1:8900
To exit, please press CTRL + C

[access] GET /home/index.js
[access] GET /favicon.ico
[access] GET /home/common.css
[access] GET /favicon.ico
[access] GET /home
[access] GET /favicon.ico
^C


$ node example/cli.js stop

Server stopped



$ node example/cli.js list

Current http services:

  +---------------+--------+-------------------------+---------+
  | Service Name  |  Port  |          Address        |  State  |
  +---------------+--------+-------------------------+---------+
  | Proxy Server  | 10010  | http://127.0.0.1:10010/ | Running |
  | Https Server  | 443    | https://127.0.0.1/      | Stopped |
  | Static Server | 80     | http://127.0.0.1/       | Stopped |
  +---------------+--------+-------------------------+---------+
```

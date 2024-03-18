# node-opcua-sample

a simple OPCUA sample client to demonstrate how to use the [node-opcua](https://github.com/node-opcua/node-opcua) SDK.

This sample comes with 3 flavors

* Typescript with async/await support.


```console
$ npm install ts-node -g
$ ts-node simple_client_ts.ts

```
* NodeJS version > 10.0 (es2017) with async/await support

```console
$ node simple_client_es8.js
```

* old NodeJS ( version 8.0)

    this version uses the old callback back mechanism which is not recommended anymore

```
$ git clone https://github.com/node-opcua/node-opcua-sample
$ cd node-opcua-sample
$ npm install
$ node simple_client.js
```

## More information

![NodeOPCUA By Example - Edition 2024](https://d2sofvawe08yqg.cloudfront.net/node-opcuabyexample-edition2024/s_hero?1700764435)

The book [NodeOPCUA by Example - Edition 2024](https://leanpub.com/node-opcuabyexample-edition2024) provides a comprehensive set of examples that goes beyond the simple example provided here.

# node-opcua-sample

a simple OPCUA sample client to demonstrate how to use the [node-opcua](https://github.com/node-opcua/node-opcua) SDK.

This sample comes with 3 flavors

typescript with async/await support

    $ npm install ts-node -g
    $ ts-node simple_client_ts.ts

recent nodejs version (es2017) with async/await support

    $ node simple_client_es18.js

old nodejs ( version 8.0)

    this version uses the old callback back mechanism which is not recommended anymore

    $ git clone https://github.com/node-opcua/node-opcua-sample
    $ cd node-opcua-sample
    $ npm install
    $ node simple_client.js


## More information 

![NodeOPCUA By Example](https://d2sofvawe08yqg.cloudfront.net/node-opcuabyexample/hero2x?1573652947)

The book [NodeOPCUA by example](https://leanpub.com/node-opcuabyexample) provides a comprehensive set of example that goes beyond the simple example provided here.

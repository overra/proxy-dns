ProxyDNS
===============
[![npm](https://img.shields.io/npm/v/proxy-dns.svg)](https://www.npmjs.com/package/proxy-dns)
[![Build Status](https://travis-ci.org/RegulateDNS/proxy-dns.svg?branch=master)](https://travis-ci.org/RegulateDNS/proxy-dns)
[![Dependencies](https://david-dm.org/RegulateDNS/proxy-dns.svg)]()
[![Coverage Status](https://coveralls.io/repos/RegulateDNS/proxy-dns/badge.svg?branch=master&service=github)](https://coveralls.io/github/RegulateDNS/proxy-dns?branch=master)
[![Gitter](https://badges.gitter.im/RegulateDNS/proxy-dns.svg)](https://gitter.im/RegulateDNS/proxy-dns?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)  

ProxyDNS provides a [koa](https://github.com/koajs/koa)-like framework for designing custom DNS proxy servers.  


## Installation

```
$ npm install proxy-dns
```
Currently only supported on node.js v4.x+ due to the use of some ES2015 features.

## Example

```
import ProxyDNS from 'proxy-dns';

const dns = new ProxyDNS();

dns.use(function* (next) {
  if (this.domain === 'reddit.com') {
    this.answer('A', {name: this.domain, address: '127.0.0.1', ttl: 100});
  }
  yield next;
});

dns.listen(53);

```

## Running tests

```
$ npm test
```

## License

ISC License (ISC)  
Copyright &copy; 2016, Adam Snodgrass

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

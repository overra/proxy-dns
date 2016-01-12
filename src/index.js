'use strict';

import dns from 'native-dns';
import compose from 'koa-compose';
import co from 'co';
import context from './context';
import {EventEmitter} from 'events';

export default class ProxyDNS extends EventEmitter {
  constructor(config={}) {
    super();

    let defaultConfig = {
      servers: [
        {address: '8.8.4.4'},
        {address: '8.8.8.8'}
      ],
      timeout: 250
    };

    this.config = {...defaultConfig, ...config};
    this.context = Object.create(context);
    this.middleware = [];
  }

  use(fn) {
    this.middleware.push(fn);
    return this;
  }

  listen() {
    let server = dns.createServer();
    server.on('request', this.requestHandler());
    server.serve.apply(server, arguments);
    return server;
  }

  requestHandler() {
    let middleware = [respond, ...this.middleware];
    let fn = co.wrap(compose(middleware));

    return (req, res) => {
      let ctx = this.createContext(req, res);
      fn.call(ctx).catch(ctx.onerror);
    }
  }

  createContext(req, res) {
    let ctx = Object.create(this.context);
    ctx.app = this;
    ctx.req = req;
    ctx.res = res;
    ctx.ip = req.address.address;
    ctx.domain = req.question[0].name;
    ctx.onerror = ::ctx.onerror;
    return ctx;
  }
}

export function *respond(next) {
  yield next;

  if (this.res.answer.length === 0) {
    this.resolve();
  } else {
    this.res.send();
  }
}

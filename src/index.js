'use strict';

import dns, {consts} from 'native-dns';
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
      timeout: 250,
      ttl: 600
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
    ctx.type = consts.QTYPE_TO_NAME[req.question[0].type];
    ctx.answers = [];
    ctx.onerror = ::ctx.onerror;
    return ctx;
  }
}

export const buildAnswer = function(answer) {
  let out = {
    name: this.domain,
    ttl: this.app.config.ttl
  };

  if (typeof answer === 'string') {
    out.address = answer;
  } else {
    out = {
      ...out,
      ...answer
    };
  }

  return dns[this.type](out);
}

export function *respond(next) {
  yield next;

  if (this.answers && Array.isArray(this.answers)) {
    this.res.answer = [
      ...this.res.answer,
      ...this.answers.map(this::buildAnswer)
    ];
  }

  if (this.res.answer.length === 0) {
    this.resolve();
  } else {
    this.res.send();
  }
}

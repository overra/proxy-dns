'use strict';

let dns = require('native-dns');
let compose = require('koa-compose');
let co = require('co');
let context = require('./lib/context');
let defaults = require('lodash.defaults')

let app = ProxyDNS.prototype;

exports = module.exports = ProxyDNS;

function ProxyDNS(config) {
  if (!(this instanceof ProxyDNS)) return new ProxyDNS(config);

  let defaultConfig = {
    servers: [
      {address: '8.8.4.4'}, 
      {address: '8.8.8.8'}
    ],
    timeout: 250
  };
  config = config || {};

  this.config = defaults(config, defaultConfig);
  this.middleware = [];
  this.context = Object.create(context);
}

app.use = function(fn) {
  this.middleware.push(fn);
  return this;
};

app.listen = function() {
  let server = dns.createServer();
  server.on('request', this.callback());
  server.on('error', function(err) { console.log(err.stack); });
  return server.serve.apply(server, arguments);
};

app.callback = function() {
  let self = this;
  let middleware = [respond].concat(this.middleware);
  let fn = co.wrap(compose(middleware));

  return function(req, res) {
    let ctx = self.createContext(req, res);
    fn.call(ctx).catch(ctx.onerror);
  }
};

app.createContext = function(req, res) {
  let ctx = Object.create(this.context);
  ctx.app = this;
  ctx.req = req;
  ctx.res = res;
  ctx.onerror = ctx.onerror.bind(ctx);
  return ctx;
};

function *respond(next) {
  yield *next;

  if (this.res.answer.length === 0) {
    this.resolve();
  } else {
    this.res.send();
  }
}
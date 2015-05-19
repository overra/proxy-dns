'use strict';

let dns = require('native-dns');
let defaults = require('lodash.defaults');

var context = module.exports = {
  type: 'dns',
  retries: 0,
  maxRetries: 3,
  onerror: function(err) {
    console.error(err.stack);
    this.res.header.rcode = dns.consts.NAME_TO_RCODE.SERVFAIL;
    this.res.send();
  },
  resolve: function () {
    let self = this;
    let config = self.app.config;
    let timedOut = false;
    let q = self.req.question[0];
    let servers = config.servers;
    let serverDefaults = {port: 53, type: 'udp'};
    let server;

    if (Array.isArray(servers)) {
      server = servers[self.retries] || servers[self.retries % server.length];
    } else {
      server = servers;
    }

    server = defaults(server, serverDefaults);

    let question = new dns.Question({
      name: q.name,
      type: dns.consts.QTYPE_TO_NAME[q.type]
    });

    let request = dns.Request({
      question: question,
      server: server,
      timeout: config.timeout
    });

    request.on('timeout', function () {
      timedOut = true;
    });

    request.on('message', function (err, response) {
      response.answer.forEach(function (answer) {
        self.res.answer.push(answer);
      });
    });

    request.on('end', function () {
      if (!self.res.answer.length) {
        self.res.header.rcode = dns.consts.NAME_TO_RCODE.NOTFOUND;
      } else {
        self.res.header.rcode = dns.consts.NAME_TO_RCODE.NOERROR;
      }

      if (!timedOut) {
        self.res.send();
      } else if (self.retries < self.maxRetries - 1) {
        self.retries++;
        self.resolve();
      }
    });

    request.send();
  },
  answer: function (type, answer) {
    var answers = this.res.answer;
    if (typeof dns[type] === 'function') {
      answers.push(dns[type](answer));
    }
  }
};

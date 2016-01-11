'use strict';

import dns, {consts} from 'native-dns';

export default {
  type: 'dns',
  retries: 0,
  maxRetries: 3,
  answer,
  onerror,
  resolve
};

function answer(type, answer) {
  if (typeof dns[type] === 'function') {
    this.res.answer = [...this.res.answer, dns[type](answer)];
  }
}

function onerror(err) {
  this.emit('error', err);
  this.res.header.rcode = consts.NAME_TO_RCODE.SERVFAIL;
  this.res.send();
}

function resolve() {
  const serverDefaults = {port: 53, type: 'udp'};
  const config = this.app.config;
  const q = this.req.question[0];
  const servers = config.servers;
  const res = this.res;
  let timedOut = false;
  let server = servers;

  if (Array.isArray(servers)) {
    server = servers[this.retries] || servers[this.retries % servers.length];
  }

  server = {...serverDefaults, ...server};

  let question = new dns.Question({
    name: q.name,
    type: consts.QTYPE_TO_NAME[q.type]
  });

  let request = dns.Request({
    question: question,
    server: server,
    timeout: config.timeout
  });

  const timeoutHandler = () => timedOut = true;
  const messageHandler = (err, response) => {
    response.answer.forEach(answer => {
      res.answer = [...res.answer, answer];
    });
  };
  const endHandler = () => {
    if (!this.res.answer.length) {
      res.header.rcode = consts.NAME_TO_RCODE.NOTFOUND;
    } else {
      res.header.rcode = consts.NAME_TO_RCODE.NOERROR;
    }

    if (!timedOut) {
      res.send();
    } else if (this.retries < this.maxRetries - 1) {
      this.retries++;
      this.resolve();
    }
  };

  request.on('timeout', timeoutHandler);
  request.on('message', messageHandler);
  request.on('end', endHandler);
  request.send();
}

'use strict';

import dgram from 'dgram';
import ProxyDNS, {respond} from '../src';
import expect from 'expect.js';

// Begin Unit Tests
describe('ProxyDNS', function () {
  var app = new ProxyDNS()

  function* middleware() {}

  describe('#use', function () {
    app.use(middleware)
      it('should append a middleware function', function () {
        expect(app.middleware.slice(-1)[0]).to.be(middleware)
      });
   });

   describe('#requestHandler', function () {
     it('should return a request callback function', function () {
       expect(app.requestHandler()).to.be.a('function');
     });
   })

   describe('#listen', function () {
     var server;
     it('should change the bind state to 1', function () {
       server = app.listen(5354);
       expect(server._socket).to.be.a(dgram.Socket)
       expect(server._socket._bindState).to.be(1);
     });
   });
});

describe('respond', function () {
  let self = {
    resolve: function () {
      this.resolved = true;
    },
    resolved: false,
    res: {
      answer: [],
      send: function () {
        this.sent = true; return this.answer;
      },
      sent: false
    }
  };

  it('should try resolving answers if none are provided', function () {
    let res = respond.call(self, Promise.resolve(true));
    res.next();
    res.next();
    expect(self.resolved).to.be(true);
  });

  it('should send provided answers when provided', function () {
    self.res.answer = [true];
    let res = respond.call(self, Promise.resolve(true));
    res.next();
    res.next();
    expect(self.res.sent).to.be(true);
  })
});

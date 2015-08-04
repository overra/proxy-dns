var dgram = require('dgram')
var ProxyDNS = require('../index.js');
var expect = require('expect.js');

// Begin Unit Tests
describe("ProxyDNS", function () {
  var app = ProxyDNS()

  function* middleware(next) {}

  describe("#use", function () {
    app.use(middleware)
      it('should append a middleware function', function () {
        expect(app.middleware.slice(-1)[0]).to.be(middleware)
      });
   });

   describe("#callback", function () {
     it('should return a request callback function', function () {
       expect(app.callback()).to.be.a('function')
     })
   })

   describe("#listen", function () {
     var server;

     it('should change the bind state to 1', function () {
       server = app.listen(5353);
       expect(server._socket).to.be.a(dgram.Socket)
       expect(server._socket._bindState).to.be(1);
     });

     it('should bind request event callback', function () {
       expect(server._events.request.toString()).to.be(ProxyDNS.prototype.callback().toString())
     });


   });
});

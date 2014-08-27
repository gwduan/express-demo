module.exports = {
  sys: {
    listenPort: 2000,
  },
  sess: {
    host: '127.0.0.1',
    port: 6379,
  },
  cache: {
    host: '127.0.0.1',
    port: 6379,
  },
  mongodb: {
    name: 'express-demo',
    host: '127.0.0.1',
    port: 27017,
    serverOptions: {auto_reconnect: true},
  },
  /*
  mongodb: {
    name: 'express-demo',
    servers: [
      {host: '10.10.0.61', port: 27017, serverOptions: {auto_reconnect:true}},
      {host: '10.10.0.62', port: 27017, serverOptions: {auto_reconnect:true}},
      {host: '10.10.0.63', port: 27017, serverOptions: {auto_reconnect:true}},
    ],
    rsOptions: {rs_name: 'rs0'},
  },
  */
};

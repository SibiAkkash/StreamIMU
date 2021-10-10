const connectionDetails = {
  sensor_topic: 'stream/imu',
  jaw_topic: 'stream/jaw_angle',
  link_topic: 'stream/link_angle',
  scheme: 'ws',
  port: '8883',
};

const connectionOptions = {
  keepalive: 10,
  clientId: 'mqtt' + Math.random().toString(16).substr(2, 8),
  protocolId: 'MQIsdp',
  protocolVersion: 3,
  clean: true,
  reconnectPeriod: 20000,
  connectTimeout: 30 * 1000,
  protocol: 'mqtt',
  rejectUnauthorized: false,
};

export { connectionDetails, connectionOptions };

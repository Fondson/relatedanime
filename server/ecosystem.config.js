module.exports = {
  apps: [
    {
      name: 'server',
      script: 'src/server.js',
      instances: process.env.CLUSTER_INSTANCES || 1,
      exec_mode: 'cluster',

      watch: process.env.PM2_ENV === 'dev' ? 'src' : undefined,
      node_args: process.env.PM2_ENV === 'dev' ? '-r dotenv/config' : '',
    },
  ],
}

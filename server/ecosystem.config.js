module.exports = {
  apps: [
    {
      name: 'server',
      script: 'src/server.js',
      instances: process.env.CLUSTER_INSTANCES || process.env.PM2_ENV === 'dev' ? 1 : 2,
      exec_mode: 'cluster',

      watch: process.env.PM2_ENV === 'dev' ? 'src' : undefined,
      node_args: process.env.PM2_ENV === 'dev' ? '-r dotenv/config' : '',
    },
  ],
}

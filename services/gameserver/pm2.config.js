module.exports = {
  apps: [
    // {
    //   name: "api-api",
    //   exec_interpreter: "ts-node",
    //   script: "./bin/api-api.ts",
    //   restart_delay: 5000,
    //   min_uptime: "20s",
    //   max_restarts: 5,
    //   ignore_watch: ["node_modules"],
    //   watch_options: {
    //     usePolling: true,
    //     interval: 1000,
    //   },
    // },
    {
      name: "tcp-service",
      exec_interpreter: "ts-node",
      script: "./src/tcp.ts",
      restart_delay: 5000,
      min_uptime: "20s",
      max_restarts: 5,
      ignore_watch: ["node_modules"],
      watch_options: {
        usePolling: true,
        interval: 1000
      }
    }
  ]
};

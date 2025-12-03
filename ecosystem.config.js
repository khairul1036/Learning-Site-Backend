module.exports = {
  apps: [
    {
      name: "lifeline-backend",
      script: "server.js",
      log_file: "./_logs/console/logs.txt",
      out_file: "./_logs/console/out.log",
      error_file: "./_logs/console/err.log",
      combine_logs: true,
      instances: "1",
      exec_mode: "cluster", // Enables clustering (load balancing)
      watch: false,
    },
  ],
}

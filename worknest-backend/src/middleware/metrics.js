const metricsStore = {
  startedAt: Date.now(),
  requestsTotal: 0,
  requestsByRoute: new Map(),
  errorsByRoute: new Map(),
  durationByRoute: new Map(),
};

const normalizeRoute = (req) => req.route?.path || req.path || "unknown";

const mapIncrement = (map, key, increment = 1) => {
  map.set(key, (map.get(key) || 0) + increment);
};

export const requestMetricsMiddleware = (req, res, next) => {
  const route = normalizeRoute(req);
  const method = req.method;
  const key = `${method} ${route}`;
  const startedAt = process.hrtime.bigint();

  metricsStore.requestsTotal += 1;
  mapIncrement(metricsStore.requestsByRoute, key, 1);

  res.on("finish", () => {
    const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    mapIncrement(metricsStore.durationByRoute, key, elapsedMs);

    if (res.statusCode >= 400) {
      mapIncrement(metricsStore.errorsByRoute, key, 1);
    }
  });

  next();
};

const formatLabels = (key) => {
  const [method, ...routeParts] = key.split(" ");
  return `method="${method}",route="${routeParts.join(" ")}"`;
};

const mapToPrometheusLines = (metricName, helpText, map) => {
  const lines = [`# HELP ${metricName} ${helpText}`, `# TYPE ${metricName} counter`];
  for (const [key, value] of map.entries()) {
    lines.push(`${metricName}{${formatLabels(key)}} ${Number(value).toFixed(2)}`);
  }
  return lines;
};

export const buildPrometheusMetrics = () => {
  const uptimeSeconds = Math.floor((Date.now() - metricsStore.startedAt) / 1000);
  const lines = [
    "# HELP process_uptime_seconds Process uptime in seconds",
    "# TYPE process_uptime_seconds gauge",
    `process_uptime_seconds ${uptimeSeconds}`,
    "# HELP http_requests_total Total HTTP requests",
    "# TYPE http_requests_total counter",
    `http_requests_total ${metricsStore.requestsTotal}`,
    ...mapToPrometheusLines(
      "http_requests_route_total",
      "Total HTTP requests by route and method",
      metricsStore.requestsByRoute,
    ),
    ...mapToPrometheusLines(
      "http_request_errors_route_total",
      "HTTP error responses by route and method",
      metricsStore.errorsByRoute,
    ),
  ];

  lines.push("# HELP http_request_duration_route_ms_total Total request duration in ms by route and method");
  lines.push("# TYPE http_request_duration_route_ms_total counter");
  for (const [key, value] of metricsStore.durationByRoute.entries()) {
    lines.push(`http_request_duration_route_ms_total{${formatLabels(key)}} ${Number(value).toFixed(2)}`);
  }

  return `${lines.join("\n")}\n`;
};

export const getMetricsSnapshot = () => ({
  uptimeSeconds: Math.floor((Date.now() - metricsStore.startedAt) / 1000),
  requestsTotal: metricsStore.requestsTotal,
  requestsByRoute: Object.fromEntries(metricsStore.requestsByRoute.entries()),
  errorsByRoute: Object.fromEntries(metricsStore.errorsByRoute.entries()),
});

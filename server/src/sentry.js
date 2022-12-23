const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')

const isSentryDsnAvailable = process.env.SENTRY_DSN != null

const init = (app) => {
  if (!isSentryDsnAvailable) return

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],

    tracesSampleRate: 0.25,
  })

  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(Sentry.Handlers.requestHandler())
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler())
}

const initErrorHandling = (app) => {
  if (!isSentryDsnAvailable) return

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler())
}

module.exports = {
  init,
  initErrorHandling,
}

export default {
  nitro: {
    preset: 'vercel-edge',
  },
  build: {
    transpile: ["mongoose"],
    extend(config: any, ctx: any) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
      }
    }
  },
  runtimeConfig: {
    mongoUrl: process.env.MONGODB_URI,
  },
};

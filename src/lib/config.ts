export const Config = {
  appveyor: {
    account: process.env.APPVEYOR_ACCOUNT,
    webhook: {
      token: process.env.APPVEYOR_WEBHOOK_TOKEN
    }
  },
  announce_channel: "#finbot-announce",
  error_channel: "#finbot-coders",
  secure_brain: {
    key: process.env.SECURE_BRAIN_KEY
  }
}
export const Config = {
  appveyor: {
    token: process.env.APPVEYOR_TOKEN,
    account: process.env.APPVEYOR_ACCOUNT,
    webhook: {
      token: process.env.APPVEYOR_WEBHOOK_TOKEN
    }
  },
  announce_channel: "#finbot-announce"
}
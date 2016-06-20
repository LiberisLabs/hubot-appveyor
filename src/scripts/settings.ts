import { Robot } from 'hubot';

export default (robot: Robot) => {
  robot.respond(/set token (.+)/i, (res) => {
    const token = res.match[1];
    if (token.length < 20)
      return res.reply('Token looks to be too short');

    robot.brain.set(`appveyor.settings.${res.message.user.id}`, { token: res.match[1] });
    res.reply("Your token has been set");
  });
}
import { Robot } from 'hubot';
import { ISecureBrain } from '../lib/secure_brain';

export default (robot: Robot, secureBrain: ISecureBrain) => {
  robot.respond(/set token (.+)/i, (res) => {
    const token = res.match[1];
    if (token.length < 20)
      return res.reply('Token looks to be too short');

    secureBrain.set(`appveyor.settings.${res.message.user.id}`, { token: res.match[1] });
    res.reply("Your token has been set");
  });
}
import { IHubot } from 'hubot';

export default (robot: IHubot) => {
  robot.respond(/hello/i, (res) => {
    res.reply("Yeah, hello etc...");
  });
}
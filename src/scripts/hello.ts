import { IRobot } from 'hubot';

export default (robot: IRobot) => {
  robot.respond(/hello/i, (res) => {
    res.reply("Yeah, hello etc");
  });
}
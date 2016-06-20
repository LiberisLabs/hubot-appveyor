import { Robot } from 'hubot';

export default (robot: Robot) => {
  robot.respond(/hello/i, (res) => {
    res.reply("Yeah, hello etc...");
  });
}
import { Robot, IScopedHttpClient, IHttpResponse } from 'hubot';
import { ISlackAdapter, ICustomMessageData } from 'hubot-slack';
import { Config } from '../lib/config';
import { IAppVeyor } from '../lib/appveyor';

export default (robot: Robot, appVeyor: IAppVeyor) => {

  robot.respond(/start build (.*)/i, res => {
    const projectSlug = res.match[1]
    res.reply('One moment please...');

    appVeyor.build(projectSlug)
      .then((data) => {
        if (!data.ok) return res.reply(`Could not start build. Got status code ${data.statusCode}`);

        const msgData: ICustomMessageData = {
          channel: res.message.room,
          text: 'Build started',
          attachments: [
            {
              fallback: `Started build of '${projectSlug}' v${data.body.version}: ${data.body.link}`,
              title: `Started build of '${projectSlug}'`,
              title_link: data.body.link,
              text: `v${data.body.version}`,
              color: '#7CD197'
            }
          ]
        };

        const slackAdapter = robot.adapter as ISlackAdapter;
        slackAdapter.customMessage(msgData);

        robot.brain.set(`${projectSlug}/${data.body.version}`, JSON.stringify({ username: res.message.user.name }));
      })
      .catch((reason) => robot.emit('error', reason, res));
  });

  robot.router.post('/hubot/appveyor/webhook', (req, res) => {
    const auth = req.headers['authorization'];
    if (auth !== Config.appveyor.webhook.token) return res.send(403);

    const data = req.body.payload ? JSON.parse(req.body.payload) : req.body;
    const outcome = data.eventName === 'build_success' ? 'succeeded' : 'failed';

    let msg = `Build v${data.eventData.buildVersion} of '${data.eventData.projectName} ${outcome}.`;
    const value = robot.brain.get(`${data.eventData.projectName}/${data.eventData.buildVersion}`);
    if (value) {
      const o = JSON.parse(value);
      msg += ` @${o.username}`;
    }

    robot.messageRoom(Config.announce_channel, msg);

    res.send(200);
  });
}

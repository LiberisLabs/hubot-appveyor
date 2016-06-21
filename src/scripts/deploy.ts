import { Robot } from 'hubot';
import { ISlackAdapter, ICustomMessageData } from 'hubot-slack';
import { Config } from '../lib/config';
import { IAppVeyor } from '../lib/appveyor';

export default (robot: Robot, appveyor: IAppVeyor) => {

  robot.respond(/deploy (.+) v(.+) to (.+)/i, res => {
    const project = res.match[1];
    const version = res.match[2];
    const environment = res.match[3];

    res.reply(`Starting deploy of '${project}' to '${environment}'...`);

    appveyor.deploy(project, version, environment)
      .then((data) => {
        if (!data.ok) return res.reply(`Could not deploy. Got status code ${data.statusCode}`);

        let msgData: ICustomMessageData = {
          channel: res.message.room,
          text: 'Deploy started',
          attachments: [
            {
              fallback: `Started deploy of '${project}' v${version} to '${environment}': ${data.body.link}`,
              title: `Started deploy of '${project}' v${version}`,
              title_link: data.body.link,
              text: `v${version}`,
              color: '#2795b6'
            }
          ]
        };

        const slackAdapter = robot.adapter as ISlackAdapter;
        slackAdapter.customMessage(msgData);
      })
      .catch((reason) => robot.emit('error', reason, res));
  });
}

import { IRobot } from 'hubot';
import { ISlackAdapter, ICustomMessage } from 'hubot-slack';
import { Config } from '../lib/config';

export default (robot: IRobot) => {
  
  robot.respond(/start build (.*)/i, res => {
    const projectSlug = res.match[1]

    const body = JSON.stringify({
      accountName: Config.appveyor.account,
      projectSlug: projectSlug
    });

    res.reply('One moment please...');

    robot.http('https://ci.appveyor.com/api/builds')
      .header('Authorization', `Bearer ${Config.appveyor.token}`)
      .header('Content-Type', 'application/json')
      .header('Accept', 'application/json')
      .post(body)((err, resp, body) => {
        if (err) return res.reply(`Got an error: ${err}`);
        if (resp.statusCode !== 200) return res.reply(`Got an unexpected status code: ${resp.statusCode}`);

        const o = JSON.parse(body);
        
        const link = `https://ci.appveyor.com/project/${Config.appveyor.account}/${projectSlug}/build/${o.version}`

        // create the message with attachment object
        let msgData: ICustomMessage = {
          channel: res.message.room,
          text: 'Build started',
          attachments: [
            {
              fallback: `Started build of '${projectSlug}' v${o.version}: ${link}`,
              title: `Started build of '${projectSlug}'`,
              title_link: link,
              text: `v${o.version}`,
              color: '#7CD197'
            }
          ]
        };

        const slackAdapter = robot.adapter as ISlackAdapter;

        // post the message
        slackAdapter.customMessage(msgData);

        robot.brain.set(`${projectSlug}/${o.version}`, JSON.stringify({ username: res.message.user.name }));
    });
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
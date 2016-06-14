import { IRobot } from 'hubot';
import { ISlackAdapter, ICustomMessage } from 'hubot-slack';
import { Config } from '../lib/config';

export default (robot: IRobot) => {
  
  robot.respond(/deploy (.+) v(\d+.\d+.\d+) to (.+)/i, res => {
    const project = res.match[1];
    const version = res.match[2];
    const environment = res.match[3];
    const account = Config.appveyor.account;
    const token = Config.appveyor.token;

    const body = JSON.stringify({
      environmentName: environment,
      accountName: account,
      projectSlug: project,
      buildVersion: version
    });

    res.reply(`Starting deploy of '${project}' to '${environment}'...`);

    robot.http('https://ci.appveyor.com/api/deployments')
      .header('Authorization', `Bearer ${token}`)
      .header('Content-Type', 'application/json')
      .header('Accept', 'application/json')
      .post(body)((err, resp, body) => {
        if (err) return res.reply(`Got an error: ${err}`);
        if (resp.statusCode !== 200) return res.reply(`Got an unexpected status code: ${resp.statusCode}`);

        const o = JSON.parse(body);
        
        const link = `https://ci.appveyor.com/project/${account}/${project}/deployment/${o.deploymentId}`

        // create the message with attachment object
        let msgData: ICustomMessage = {
          channel: res.message.room,
          text: 'Deploy started',
          attachments: [
            {
              fallback: `Started deploy of '${project}' v${version} to '${environment}': ${link}`,
              title: `Started deploy of '${project}' v${version}`,
              title_link: link,
              text: `v${version}`,
              color: '#2795b6'
            }
          ]
        };

        const slackAdapter = robot.adapter as ISlackAdapter;

        // post the message
        slackAdapter.customMessage(msgData);

    });
  });
}
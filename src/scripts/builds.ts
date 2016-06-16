import { IHubot, IScopedHttpClient, IHttpResponse } from 'hubot';
import { ISlackAdapter, ICustomMessageData } from 'hubot-slack';
import { Config } from '../lib/config';
import { IAppVeyor } from '../lib/appveyor';

export default (robot: IHubot, appVeyor: IAppVeyor) => {

  const getColour = (status: string) => {
    switch (status) {
      case 'success': return '#7CD197';
      case 'failed': return '#D17C8C';
    }
    return '#CCCCCC';
  }

  robot.respond(/list builds of (.*)/i, res => {
    const projectSlug = res.match[1]
    res.reply('One moment please...');

    appVeyor.builds(projectSlug)
      .then((data) => {
        let msgData: ICustomMessageData = {
          channel: res.message.room,
          text: `Builds: ${projectSlug}`,
          attachments: data.body.builds.map((build) => {
            return {
              fallback: `Build v${build.version}: ${build.status} ${build.link}`,
              title: `Build v${build.version}`,
              title_link: build.link,
              text: build.status,
              color: getColour(build.status)
            }
          })
        };

        const slackAdapter = robot.adapter as ISlackAdapter;
        slackAdapter.customMessage(msgData);
      })
      .catch(res.reply);
  });
}

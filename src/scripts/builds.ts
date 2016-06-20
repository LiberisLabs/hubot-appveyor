import { Robot, IScopedHttpClient, IHttpResponse } from 'hubot';
import { ISlackAdapter, ICustomMessageData } from 'hubot-slack';
import { Config } from '../lib/config';
import { IAppVeyor } from '../lib/appveyor';

export default (robot: Robot, appVeyor: IAppVeyor) => {

  const getColour = (status: string) => {
    switch (status) {
      case 'success': return '#7CD197';
      case 'failed': return '#D17C8C';
    }
    return '#CCCCCC';
  }

  const firstUpper = (s: string) => {
    return s[0].toUpperCase() + s.slice(1);
  }

  robot.respond(/list builds of (.*)/i, res => {
    const projectSlug = res.match[1]
    res.reply('One moment please...');

    appVeyor.builds(projectSlug)
      .then((data) => {
        let msgData: ICustomMessageData = {
          channel: res.message.room,
          attachments: data.body.builds.map((build) => {
            return {
              fallback: `Build v${build.version}: ${build.status} ${build.link}`,
              title: `Build v${build.version}`,
              title_link: build.link,
              text: firstUpper(build.status),
              color: getColour(build.status),
              fields: [
                {
                  title: "Branch",
                  value: build.branch,
                  short: true
                },
                {
                  title: "Committer",
                  value: build.committer,
                  short: true
                }
              ]
            }
          })
        };

        const slackAdapter = robot.adapter as ISlackAdapter;
        slackAdapter.customMessage(msgData);
      })
      .catch(res.reply);
  });
}

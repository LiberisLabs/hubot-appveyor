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

  robot.respond(/list (\d+ )?builds of (.*)/i, res => {
    const buildCount = res.match.length === 3 ? Number(res.match[1]) : 3;
    const projectSlug = res.match.length === 3 ? res.match[2] : res.match[1];
    res.reply('One moment please...');

    const userSettings = robot.brain.get(`appveyor.settings.${res.message.user.id}`);
    if (userSettings == null)
      return res.reply(`You must whisper me your AppVeyor API token with "/msg @${robot.name} set token <token>" first`);

    appVeyor.builds(projectSlug, buildCount, userSettings.token)
      .then((data) => {
        let msgData: ICustomMessageData = {
          channel: res.message.room,
          attachments: data.body.builds.map((build) => {
            return {
              fallback: `Build v${build.version}: ${build.status} ${build.link}`,
              title: `Build v${build.version}`,
              title_link: build.link,
              color: getColour(build.status),
              fields: [
                {
                  title: build.branch,
                  short: true
                },
                {
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

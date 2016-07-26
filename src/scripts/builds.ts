import { Robot, IScopedHttpClient, IHttpResponse } from 'hubot';
import { ISlackAdapter, ICustomMessageData } from 'hubot-slack';
import { Config } from '../lib/config';
import { IAppVeyor } from '../lib/appveyor';
import { ISecureBrain } from '../lib/secure_brain';

export default (robot: Robot, appVeyor: IAppVeyor, secureBrain: ISecureBrain) => {

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

    const userSettings = secureBrain.get(`appveyor.settings.${res.message.user.id}`);
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

  robot.router.post('/slash/list-builds', (req, res) => {
    const buildCount = 5;
    const projectSlug = req.body.text;

    const userSettings = secureBrain.get(`appveyor.settings.${req.body.user_id}`);
    if (userSettings == null) {
      res.write(`You must whisper me your AppVeyor API token with "/msg @${robot.name} set token <token>" first`);
      return res.send(200);
    }

    appVeyor.builds(projectSlug, buildCount, userSettings.token)
      .then((data) => {
        let msgData: ICustomMessageData = {
          response_type: 'ephemeral',
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

        res.write(JSON.stringify(msgData));
        res.send(200);
      })
      .catch(() => res.send(500));
  });
}

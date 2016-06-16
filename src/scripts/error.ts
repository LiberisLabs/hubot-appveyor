import { IHubot, IScopedHttpClient, IHttpResponse } from 'hubot';
import { ISlackAdapter, ICustomMessageData } from 'hubot-slack';
import { Config } from '../lib/config';

export default (robot: IHubot) => {

  robot.error((err, res) => {
    robot.logger.error(`Caught unhandled error.`, err);

    const slackAdapter = robot.adapter as ISlackAdapter;

    const customMessage: ICustomMessageData = {
      channel: Config.error_channel,
      attachments: [{
        fallback: `I've just encountered this error: ${err}`,
        color: '#801515',
        title: `I've just encountered an error`,
        text: `\`\`\`\n${err.stack}\n\`\`\``,
        mrkdwn_in: ['text']
      }]
    };

    slackAdapter.customMessage(customMessage);

    if (res) res.reply('Uhh, sorry, I just experienced an error :goberserk:');
  });
}

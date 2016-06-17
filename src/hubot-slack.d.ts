declare module "hubot-slack" {
  import { IAdapter } from 'hubot';

  // see https://api.slack.com/docs/attachments
  // also https://api.slack.com/docs/formatting/builder
  interface IAttachment {
    fallback: string;
    color: string;
    pretext?: string;
    
    author_name?: string;
    author_link?: string;
    author_icon?: string;

    title: string;
    title_link?: string;
    
    text?: string;

    fields?: [{
      title: string;
      value: string;
      short: boolean;
    }];

    image_url?: string;
    thumb_url?: string;

    footer?: string;
    footer_icon?: string;
    
    ts?: number;

    mrkdwn_in?: string[]
  }

  interface ICustomMessage {
    envelope?: any;
    room?: string;
  }

  interface ICustomMessageData {
    channel: string;
    message?: ICustomMessage;
    text?: string;
    attachments?: Array<IAttachment>;
    username?: string;
    icon_url?: string;
    icon_emoji?: string;
  }

  interface ISlackAdapter extends IAdapter {
    customMessage(msg: ICustomMessageData): void;
  }
}
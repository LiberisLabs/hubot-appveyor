declare module "hubot-slack" {
  import { IAdapter } from 'hubot';

  interface IAttachment {
    fallback: string;
    title: string;
    title_link?: string;
    text: string;
    color?: string;
  }

  interface ICustomMessage {
    channel: string;
    text: string;
    attachments?: Array<IAttachment>;
  }

  interface ISlackAdapter extends IAdapter {
    customMessage(msg: ICustomMessage): void;
  }
}
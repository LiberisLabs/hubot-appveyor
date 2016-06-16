declare module "hubot" {
  import * as express from 'express';

  interface IHttpResponse {
    statusCode: number;
  }

  interface IHttpClientHandler {
    (err: Error, res: IHttpResponse, body: string): void;
  }

  interface IScopedHttpClient {
    header(name: string, value: string): IScopedHttpClient;
    post(body: string): (handler: IHttpClientHandler) => void;
  }

  interface IMessageDetail {
    room: string;
    user: {
      name: string;
    }
  }

  interface IResponse {
    match: string[];
    message: IMessageDetail;

    reply(msg: string);
  }

  interface IListener {
    (res: IResponse): any;
  }

  interface IHubotBrain {
    get(key: string): string;
    set(key: string, value: string);
  }

  interface IAdapter {

  }

  interface IHubotLogger {
    log(levelStr: string, args: any[]);
    error(...msg: any[]);
    emergency(...msg: any[]);
    alert(...msg: any[]);
    critical(...msg: any[]);
    warning(...msg: any[]);
    notice(...msg: any[]);
    info(...msg: any[]);
    debug(...msg: any[]);
  }

  interface IHubot {
    adapter: IAdapter;
    brain: IHubotBrain;
    router: express.Application;
    logger: IHubotLogger;

    respond(matcher: RegExp, listener: IListener);
    http(url: string): IScopedHttpClient;
    messageRoom(room: string, msg: string);
    error(handler: (err: Error, res: IResponse) => void)
    emit(event: string, ...args: any[]): boolean;
  }
}
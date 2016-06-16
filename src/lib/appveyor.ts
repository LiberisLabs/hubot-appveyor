import { IScopedHttpClient, IHttpResponse } from 'hubot';

export interface IBuildResponse {
  accountName: string;
  projectSlug: string;
  version: string;
  link: string;
}

export interface IDeployResponse {
  link: string;
}

export interface IAppVeyor {
  build(projectSlug: string): Promise<IBuildResponse>;
  deploy(projectSlug: string, version: string, environment: string): Promise<IDeployResponse>;
}

export class AppVeyor implements IAppVeyor {
  constructor(private http: (url: string) => IScopedHttpClient, private token: string, private accountName: string) { }

  public build(projectSlug) {
    const body = JSON.stringify({
      accountName: this.accountName,
      projectSlug: projectSlug
    });

    return new Promise<IBuildResponse>((resolve, reject) => {
      this.post('https://ci.appveyor.com/api/builds', body, (err, resp, data) => {
        if (err) return reject(err);
        if (resp.statusCode !== 200) return reject(new Error(`Got an unexpected status code: ${resp.statusCode}`));

        const o = JSON.parse(data);

        resolve({
          accountName: this.accountName,
          projectSlug: projectSlug,
          version: o.version,
          link: `https://ci.appveyor.com/project/${this.accountName}/${projectSlug}/build/${o.version}`
        });
      });
    });
  }

  public deploy(projectSlug, version, environment) {
    const body = JSON.stringify({
      environmentName: environment,
      accountName: this.accountName,
      projectSlug: projectSlug,
      buildVersion: version
    });

    return new Promise<IDeployResponse>((resolve, reject) => {
      this.post('https://ci.appveyor.com/api/deployments', body, (err, resp, data) => {
        if (err) return reject(err);
        if (resp.statusCode !== 200) return reject(new Error(`Got an unexpected status code: ${resp.statusCode}`));

        const o = JSON.parse(data);

        resolve({
          link: `https://ci.appveyor.com/project/${this.accountName}/${projectSlug}/deployment/${o.deploymentId}`
        });
      });
    });
  }

  private post(url: string, body: string, callback: (err: Error, resp: IHttpResponse, data: string) => void) {
    this.http(url)
      .header('Authorization', `Bearer ${this.token}`)
      .header('Content-Type', 'application/json')
      .header('Accept', 'application/json')
      .post(body)(callback);
  }
}

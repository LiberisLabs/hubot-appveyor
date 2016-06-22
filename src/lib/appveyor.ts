import { IScopedHttpClient, IHttpResponse } from 'hubot';

export interface IAppVeyorResponse {
  ok: boolean;
  statusCode: number;
  body?: any;
}

export interface IBuildResponse extends IAppVeyorResponse {
  body?: {
    accountName: string;
    projectSlug: string;
    version: string;
    link: string;
  }
}

export interface IDeployResponse extends IAppVeyorResponse {
  body?: {
    link: string;
  }
}

export interface IBuildsResponse extends IAppVeyorResponse {
  body?: {
    accountName: string;
    projectSlug: string;
    builds: Array<IBuildsBuildResponse>
  }
}

interface IBuildsBuildResponse {
  version: string;
  message: string;
  branch: string;
  committer: string;
  status: string;
  link: string;
}

export interface IAppVeyor {
  build(projectSlug: string, token: string): Promise<IBuildResponse>;
  builds(projectSlug: string, count: number, token: string): Promise<IBuildsResponse>;
  deploy(projectSlug: string, version: string, environment: string, token: string): Promise<IDeployResponse>;
}

export class AppVeyor implements IAppVeyor {
  constructor(
    private _http: (url: string) => IScopedHttpClient,
    private _accountName: string) { }

  public build(projectSlug: string, token: string) {
    const body = JSON.stringify({
      accountName: this._accountName,
      projectSlug: projectSlug
    });

    return new Promise<IBuildResponse>((resolve, reject) => {
      this.post('https://ci.appveyor.com/api/builds', body, token, (err, resp, data) => {
        if (err) return reject(err);
        if (resp.statusCode !== 200) return resolve({
          ok: false,
          statusCode: resp.statusCode
        });

        const o = JSON.parse(data);

        resolve({
          ok: true,
          statusCode: resp.statusCode,
          body: {
            accountName: this._accountName,
            projectSlug: projectSlug,
            version: o.version,
            link: `https://ci.appveyor.com/project/${this._accountName}/${projectSlug}/build/${o.version}`
          }
        });
      });
    });
  }

  public builds(projectSlug: string, count: number, token: string) {
    return new Promise<IBuildsResponse>((resolve, reject) => {
      this.get(`https://ci.appveyor.com/api/projects/${this._accountName}/${projectSlug}/history?recordsNumber=${count}`, token, (err, resp, data) => {
        if (err) return reject(err);
        if (resp.statusCode !== 200) return resolve({ ok: false, statusCode: resp.statusCode });

        const o = JSON.parse(data);

        resolve({
          ok: true,
          statusCode: resp.statusCode,
          body: {
            accountName: this._accountName,
            projectSlug: projectSlug,
            builds: o.builds.map((build) => ({
              version: build.version,
              message: build.message,
              branch: build.branch,
              committer: build.committerName,
              status: build.status,
              link: `https://ci.appveyor.com/project/${this._accountName}/${projectSlug}/build/${build.version}`
            }))
          }
        });
      });
    });
  }

  public deploy(projectSlug: string, version: string, environment: string, token: string) {
    const body = JSON.stringify({
      environmentName: environment,
      accountName: this._accountName,
      projectSlug: projectSlug,
      buildVersion: version
    });

    return new Promise<IDeployResponse>((resolve, reject) => {
      this.post('https://ci.appveyor.com/api/deployments', body, token, (err, resp, data) => {
        if (err) return reject(err);
        if (resp.statusCode !== 200) return resolve({
          ok: false,
          statusCode: resp.statusCode
        });

        const o = JSON.parse(data);

        resolve({
          ok: true,
          statusCode: resp.statusCode,
          body: {
            link: `https://ci.appveyor.com/project/${this._accountName}/${projectSlug}/deployment/${o.deploymentId}`
          }
        });
      });
    });
  }

  private post(url: string, body: string, token: string, callback: (err: Error, resp: IHttpResponse, data: string) => void) {
    this._http(url)
      .header('Authorization', `Bearer ${token}`)
      .header('Content-Type', 'application/json')
      .header('Accept', 'application/json')
      .post(body)(callback);
  }

  private get(url: string, token: string, callback: (err: Error, resp: IHttpResponse, data: string) => void) {
    this._http(url)
      .header('Authorization', `Bearer ${token}`)
      .header('Content-Type', 'application/json')
      .header('Accept', 'application/json')
      .get()(callback);
  }
}

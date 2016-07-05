import * as crypto from 'crypto';
import { IBrain } from 'hubot';

class Cipher {
  constructor(private _key: string) { }

  encrypt(value: string) {
    const cipher = crypto.createCipher('aes256', this._key);
    return cipher.update(value, 'utf8', 'hex') + cipher.final('hex');
  }

  decrypt(value: string) {
    const decipher = crypto.createDecipher('aes256', this._key);
    return decipher.update(value, 'hex', 'utf8') + decipher.final('utf8');
  }
}

interface ISecureEnvelope {
  secure: string;
}

export interface ISecureBrain extends IBrain {
  get(key: string): any;
  set(key: string, value: any): ISecureBrain;
}

export class SecureBrain implements ISecureBrain {
  private _cipher: Cipher;

  constructor(private _brain: IBrain, key: string) {
    this._cipher = new Cipher(key);
  }

  get(key: string): any {
    const brainValue = this._brain.get(key);

    if (brainValue === null)
      return null;

    if (brainValue.secure !== undefined) {
      const secureEnvelope: ISecureEnvelope = brainValue;
      let decipheredValue: string;
      try {
        decipheredValue = this._cipher.decrypt(secureEnvelope.secure);
      } catch (_) {
        return null;
      }
      return JSON.parse(decipheredValue);
    }

    return brainValue;
  }

  set(key: string, value: any): ISecureBrain {
    const secureValue = this._cipher.encrypt(JSON.stringify(value));
    const secureEnvelope: ISecureEnvelope = { secure: secureValue };
    this._brain.set(key, secureEnvelope);
    return this;
  }
}
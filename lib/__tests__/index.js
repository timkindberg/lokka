import {describe, it} from 'mocha';
import {expect} from 'chai';
import Lokka from '../';
import EchoTransport from './echo_transport';
import {trimIt} from './utils';

describe('Lokka', () => {
  describe('constructor()', () => {
    describe('transport is not an instance of LokkaTransport', () => {
      it('should throw an error', () => {
        expect(() => new Lokka()).to.throw(/transport should be an instance of LokkaTransport/);
      });
    });

    describe('transport is an instance of LokkaTransport', () => {
      it('should create a Lokka instance', () => {
        const options = {transport: new EchoTransport()};
        expect(() => new Lokka(options)).to.not.throw;
      });
    });
  });

  describe('send()', () => {
    describe('called without a rawQuery', () => {
      it('should throw an error', () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        expect(() => lokka.send()).to.throw(/rawQuery is required!/);
      });
    });

    describe('called with a rawQuery', () => {
      it('should call the transport', async () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        const rawQuery = '{name}';
        const result = await lokka.send(rawQuery);
        // we'll get the result as the query, 
        // just because of the echo transport
        expect(result).to.be.equal(rawQuery);
      });
    });
  });

  describe('createFragment()', () => {
    describe('called without a fragment', () => {
      it('should throw an error', () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        expect(() => lokka.createFragment()).to.throw(/fragment is required!/);
      });
    });

    describe('called with a fragment', () => {
      it('should add name to the fragment and save it', () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        const name = lokka.createFragment(`
          fragment on Post {
            title
          }
        `);
        const savedFragment = lokka._fragments[name];
        const expectedFragment = `
          fragment ${name} on Post {
            title
          }
        `;
        expect(trimIt(savedFragment)).to.be.equal(trimIt(expectedFragment));
      });

      it('should return the fragment name', () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        const name = lokka.createFragment(`
          fragment on Post {
            title
          }
        `);
        expect(name).to.be.ok;
      });
    });
  });

  describe('_findFragments()', () => {
    it('should get fragments listed in a query', () => {
      const lokka = new Lokka({transport: new EchoTransport()});
      const f1 = lokka.createFragment(`fragment on Post {title}`);
      const f2 = lokka.createFragment(`fragment on Post {_id}`);

      const fragments = lokka._findFragments(`
        {
          recentPosts {
            ...${f1},
            ...${f2}
          }
        }
      `);

      expect(fragments).to.be.deep.equal([
        `fragment ${f1} on Post {title}`,
        `fragment ${f2} on Post {_id}`,
      ]);
    });

    it('should get fragments listed in a fragment', () => {
      const lokka = new Lokka({transport: new EchoTransport()});
      const f1 = lokka.createFragment(`fragment on Post {title}`);
      const f2 = lokka.createFragment(`fragment on Post {_id}`);

      const fragments = lokka._findFragments(`
        fragment kk on Post {
          ...${f1},
          ...${f2}
        }
      `);

      expect(fragments).to.be.deep.equal([
        `fragment ${f1} on Post {title}`,
        `fragment ${f2} on Post {_id}`,
      ]);
    });

    it('should get nested fragments', () => {
      const lokka = new Lokka({transport: new EchoTransport()});
      const f1 = lokka.createFragment(`fragment on Post {title}`);
      const f2 = lokka.createFragment(`fragment on Post {...${f1}}`);
      const f3 = lokka.createFragment(`fragment on Post {author}`);

      const fragments = lokka._findFragments(`
        {
          recentPosts {
            ...${f2}
          }
        }
      `);

      expect(fragments).to.be.deep.equal([
        `fragment ${f2} on Post {...${f1}}`,
        `fragment ${f1} on Post {title}`,
      ]);
    });

    it('should merge duplicate fragments', () => {
      const lokka = new Lokka({transport: new EchoTransport()});
      const f1 = lokka.createFragment(`fragment on Post {title}`);
      const f2 = lokka.createFragment(`fragment on Post {_id}`);

      const fragments = lokka._findFragments(`
        {
          recentPosts {
            ...${f1},
            ...${f2},
            ...${f1},
          }
        }
      `);

      expect(fragments).to.be.deep.equal([
        `fragment ${f1} on Post {title}`,
        `fragment ${f2} on Post {_id}`,
      ]);
    });

    it('should throw an error if fragment is not there', () => {
      const lokka = new Lokka({transport: new EchoTransport()});
      const run = () => {
        lokka._findFragments(`
          {
            recentPosts {
              ...someOtherFragment
            }
          }
        `);
      };

      expect(run).to.throw(/There is no such fragment: someOtherFragment/);
    });
  });

  describe('query()', () => {
    describe('called without a query', () => {
      it('should throw an error', () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        expect(() => lokka.query()).to.throw(/query is required!/);
      });
    });

    describe('called with a query', () => {
      it('should add necessory fragments to the query');
      it('should call the .send()');
    });
  });

  describe('mutate', () => {
    describe('called without a query', () => {
      it('should throw an error');
    });

    describe('called with a query', () => {
      it('should create the proper mutation query');
      it('should add necessory fragments');
      it('should call .send() and get the result');
    });
  });
});
export default { auth, sheets };
export { serviceAccount, oauth, getSpreadsheetValues };


const SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'];

function auth(opts) {
  const google = opts.google;

  return {
    start({ config }) {
      if (config.token) return oauth({ config, google });

      return serviceAccount({ config, google });
    }
  };
}

function serviceAccount({ config, google }) {
  const options = {
    ...config,
    credentials: parseObj(config.credentials),
    scopes: parseArray(config.scopes, ",") || SCOPES,
  };

  return new google.auth.GoogleAuth(options);
}


function oauth({ config, google }) {
  const credentials = parseObj(config.credentials);
  const token = parseObj(config.token);

  const { client_secret, client_id, redirect_uris } = credentials;
  const client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  client.setCredentials(token);

  return client;
}


function parseArray(x, sep) {
  return typeof x === "string" ? x.split(sep) : x;
}


function parseObj(x) {
  return typeof x === "string" ? JSON.parse(x) : x;
}


async function getSpreadsheetValues({ auth, google }, { spreadsheetId, range }) {
  const sheets = google.sheets({ version: 'v4', auth });
  const { promise, resolve, reject } = Promise.withResolvers();
  sheets.spreadsheets.values.get({ spreadsheetId, range }, (err, res) => {
    if (err) reject(err);
    else resolve(res.data.values);
  });

  return promise;
}


function sheets(opts) {
  const google = opts.google;

  return {
    start({ auth }) {
      return {
        getValues(params) {
          return getSpreadsheetValues({ auth, google }, params);
        },
        valuesToObjects
      };
    }
  };
}


function valuesToObjects(values, headers) {
  const keys = headers || values[0];
  const objs = [];
  for (let i = 1; i < values.length; i++) {
    const o = {};
    for (let j = 0; j < keys.length; j++) {
      if (keys[j]) {
        o[keys[j]] = _emptyToNull(values[i][j]);
      }
    }
    objs.push(o);
  }

  return objs;
}


function _emptyToNull(val) {
  if (val === null) return null;
  return val === "" ? null : val;
}

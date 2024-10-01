const request = require('request');
const url = 'http://localhost:5000';

const baseString = 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE';
let auth_token = '';

function getAuthToken() {
  return new Promise((resolve, reject) => {
    request.get(
      url + '/connect',
      {
        headers: {
          Authorization: baseString,
        },
      },
      (err, resp, body) => {
        if (err) {
          reject(err);
        }
        try {
          auth_token = JSON.parse(body).token;
          resolve(auth_token);
        } catch (e) {
          console.log(e.toString());
        }
      }
    );
  });
}
function checkAuth() {
  request.get(url + '/status', (err, resp, body) => {
    if (err) {
      console.log(err.toString());
    }
    console.log(JSON.parse(body));
  });

  request.get(url + '/stats', (err, resp, body) => {
    if (err) {
      console.log(err.toString());
    }
    console.log(JSON.parse(body));
  });

  let auth_token;

  (async () => {
    try {
      auth_token = await getAuthToken();

      // right token
      request.get(
        url + '/users/me',
        {
          headers: {
            'X-token': auth_token,
          },
        },
        (err, resp, body) => {
          console.log('getMe:', JSON.parse(body));
        }
      );

      // wrong token
      request.get(
        url + '/users/me',
        {
          headers: {
            'X-token': auth_token + 'wrong',
          },
        },
        (err, resp, body) => {
          console.log('getMe:', JSON.parse(body));
        }
      );
      // disconnect
      request.get(
        url + '/disconnect',
        {
          headers: {
            'X-token': auth_token,
          },
        },
        () => {
          request.get(
            url + '/users/me',
            {
              headers: {
                'X-token': auth_token,
              },
            },
            (err, resp, body) => {
              console.log('getMe:', JSON.parse(body));
            }
          );
        }
      );

      console.log(JSON.parse(request.res));
    } catch (err) {
      console.log(err.toString());
    }
  })();
}

function checkFile() {
  getAuthToken()
    .then((val) => {})
    .catch((e) => {});
}
checkAuth();

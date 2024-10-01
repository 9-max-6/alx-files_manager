const request = require('request');

const url = 'http://localhost:5000';

const baseString = 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE';

function getAuthToken() {
  return new Promise((resolve, reject) => {
    request.get(
      `${url}/connect`,
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
      },
    );
  });
}
function checkAuth() {
  request.get(`${url}/status`, (err, resp, body) => {
    if (err) {
      console.log(err.toString());
    }
    console.log(JSON.parse(body));
  });

  request.get(`${url}/stats`, (err, resp, body) => {
    if (err) {
      console.log(err.toString());
    }
    console.log(JSON.parse(body));
  });

  (async () => {
    try {
      const auth_token = await getAuthToken();

      // right token
      request.get(
        `${url}/users/me`,
        {
          headers: {
            'X-token': auth_token,
          },
        },
        (err, resp, body) => {
          console.log('getMe:', JSON.parse(body));
        },
      );

      // wrong token
      request.get(
        `${url}/users/me`,
        {
          headers: {
            'X-token': `${auth_token}wrong`,
          },
        },
        (err, resp, body) => {
          console.log('getMe:', JSON.parse(body));
        },
      );
      // disconnect
      request.get(
        `${url}/disconnect`,
        {
          headers: {
            'X-token': auth_token,
          },
        },
        () => {
          request.get(
            `${url}/users/me`,
            {
              headers: {
                'X-token': auth_token,
              },
            },
            (err, resp, body) => {
              console.log('getMe:', JSON.parse(body));
            },
          );
        },
      );

      console.log(JSON.parse(request.res));
    } catch (err) {
      console.log(err.toString());
    }
  })();
}

function checkFile() {
  getAuthToken()
    .then((auth_token) => {})
    .catch((e) => {});
}

function makeUser() {
  request.post(
    `${url}/users`,
    {
      body: {
        email: 'mutukumsxaxwel@gmail.com',
      },
      json: true,
    },
    (err, res, body) => {
      console.log(body);
    },
  );
}

function authUser() {
  const baseString = Buffer.from('mutukumaxwel@gmail.com:max').toString(
    'base64',
  );
  console.log(baseString);
  request.get(
    `${url}/connect`,
    {
      headers: {
        Authorization: `Basic ${baseString}`,
      },
      json: true,
    },
    (err, res, body) => {
      console.log(body);
    },
  );
}
// authUser();
makeUser();

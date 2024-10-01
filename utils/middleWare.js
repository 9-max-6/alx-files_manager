const setUser = (req, res, next) => {
  const { authorization } = req.headers;
  const credentials = Buffer.from(
    authorization.split(' ')[1],
    'base64'
  ).toString('ascii');

  const email = credentials.split(':')[0];
  const password = credentials.split(':')[1];

  if (email && password) {
    req.user = {
      email: email,
      password: password,
    };
  } else {
    req.user = false;
  }
  next();
};

export default setUser;

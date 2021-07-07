const express = require('express');
const router = express.Router();
const tokens = require('../auth/tokens');
const secret = require('../auth/config.json');
const passport = require('passport');
const db = require('../models');
const helper = require('../helpers/serialize');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const User = require('../models/schemas/user');

const auth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (!user || err) {
      res.status(401).json({
        code: 401,
        message: 'Unauthorized',
      });
    } else {
      next();
    }
  })(req, res, next);
};

router.post('/registration', async (req, res) => {
  const { username } = req.body;
  const user = await db.getUserByName(username);
  if (user) {
    return res
      .status(400)
      .json({ code: 400, message: 'Пользователь уже существует' });
  }
  try {
    const newUser = await db.createUser(req.body);
    const token = await tokens.createTokens(newUser, secret.secret);
    res.json({
      ...helper.serializeUser(newUser),
      ...token,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});

router.post('/login', async (req, res, next) => {
  passport.authenticate(
    'local',
    { session: false },
    async (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).json({
          code: 400,
          message: 'Пользователь с таким именем не найден',
        });
      }
      if (user) {
        const token = await tokens.createTokens(user, secret.secret);
        console.log(token);
        res.json({
          ...helper.serializeUser(user),
          ...token,
        });
      }
    }
  )(req, res, next);
});

router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.headers['authorization'];
  const data = await tokens.refreshTokens(refreshToken, db, secret.secret);
  res.json({ ...data });
});

router
  .get('/profile', auth, async (req, res) => {
    const token = req.headers['authorization'];
    const user = await tokens.getUserByToken(token, db, secret.secret);
    res.json({
      ...helper.serializeUser(user),
    });
  })
  .patch('/profile', auth, async (req, res, next) => {
    try {
      const token = req.headers['authorization'];
      const user = await tokens.getUserByToken(token, db, secret.secret);
      if (!user) {
        return res.status(400).json({
          code: 400,
          message: 'Пользователь не найден',
        });
      }
      const form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return next(err);
        }
        const {
          oldPassword,
          newPassword,
          surName,
          firstName,
          middleName,
        } = fields;

        const arrayForCondition = Object.keys(fields).map(function (key) {
          return fields[key];
        });
        let avatar = files.avatar;
        if (!avatar) {
          avatar = user.image;
        }
        if (!avatar || arrayForCondition.some((element) => !element)) {
          return res.status(400).json({
            code: 400,
            message: 'Заполните все поля формы!',
          });
        }

        /* let userSchema = await User.findById(user.id);
        if (!userSchema.validPassword(oldPassword)) {
          return res.status(400).json({
            code: 400,
            message: 'Введённый вами старый пароль не совпадает с существующим',
          });
        } */
        // Проверяем папку на существование + существование у пользователя аватара
        let upload = path.join('./build', 'upload');
        form.uploadDir = path.join(process.cwd(), upload);
        if (!fs.existsSync(form.uploadDir)) {
          fs.mkdirSync(form.uploadDir);
        } else {
          if (user.image) {
            const oldAvatar = path.join(process.cwd(), '/build', user.image);
            if (fs.existsSync(oldAvatar)) {
              fs.unlinkSync(oldAvatar);
            }
          }
        }

        const fileName = path.join(upload, avatar.name);
        fs.rename(avatar.path, fileName, async function (err) {
          if (err) {
            console.error(err.message);
            return;
          }
          const pathFromAssets = fileName.substr(fileName.indexOf('upload'));
          let src = `./${pathFromAssets.replace(/\\/g, '/')}`;

          user.firstName = firstName;
          user.middleName = middleName;
          user.surName = surName;
          user.password = newPassword;
          user.image = src;

          try {
            const updatedUser = await db.updateUserProfile(user.id, user);
            res.json({
              ...helper.serializeUser(updatedUser),
            });
          } catch (e) {
            next(e);
          }
        });
      });
    } catch (e) {
      next(e);
    }
  });

router
  .get('/users', auth, async (req, res) => {
    const users = await db.getUsers();
    res.json(users.map((user) => helper.serializeUser(user)));
  })
  .patch('/users/:id/permission', auth, async (req, res, next) => {
    try {
      const user = await db.updateUserPermission(req.params.id, req.body);
      res.json({
        ...helper.serializeUser(user),
      });
    } catch (e) {
      next(e);
    }
  })
  .delete('/users/:id', auth, async (req, res) => {
    await db.deleteUser(req.params.id);
    res.status(204).json({});
  });

router
  .get('/news', auth, async (req, res, next) => {
    try {
      const news = await db.getNews();
      return res.json(news);
    } catch (e) {
      next(e);
    }
  })
  .post('/news', auth, async (req, res, next) => {
    try {
      const token = req.headers['authorization'];
      const user = await tokens.getUserByToken(token, db, secret.secret);
      await db.createNews(req.body, helper.serializeUser(user));
      const news = await db.getNews();
      res.json(news);
    } catch (e) {
      next(e);
    }
  })
  .patch('/news/:id', auth, async (req, res, next) => {
    try {
      await db.updateNews(req.params.id, req.body);
      const news = await db.getNews();
      res.json(news);
    } catch (e) {
      next(e);
    }
  })
  .delete('/news/:id', auth, async (req, res, next) => {
    try {
      await db.deleteNews(req.params.id);
      const news = await db.getNews();
      res.json(news);
    } catch (e) {
      next(e);
    }
  });

module.exports = router;

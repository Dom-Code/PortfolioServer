import { Request, Response, NextFunction } from 'express';
import logging from '../config/logging';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/user';
import Project from '../models/project';
import ProfileId from '../models/profile_Id';
import signJWT from '../middleware/signJWT';
import generateAccessToken from '../middleware/generateToken';
import Refresh_Token_List from '../models/refresh';
const crypto = require('crypto');

const NAMESPACE = 'User Controller';

const generateProfileId = () => {
    return crypto.randomBytes(5).toString('hex');
};

const checkProfileId = (id: string) => {
    ProfileId.find({ profile_id: id })
        .exec()
        .then((result) => {
            if (result.length === 0) {
                return true;
            }
            return false;
        })
        .catch((err) => {
            return err;
        });
};

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    User.find({ _id: res.locals.jwt.userId })
        .exec()
        .then((users) => {
            const user = users[0];
            ProfileId.find({ user_id: user['_id'] }).then((profile) => {
                logging.info(NAMESPACE, 'Token validated');
                return res.status(200).json({
                    message: 'User is authorized',
                    profileId: profile[0]['profile_id']
                });
            });
        })
        .catch((err) => {
            return res.status(500).json({
                message: err.message
            });
        });
};

const saveProject = (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.jwt.userId;
    const projectId = req.body.projectId;
    const projectName = req.body.projectName;
    const projectPublic = req.body.projectPublic;

    const filter = { user_id: userId, _id: projectId };

    const updateDocument = {
        $set: {
            code: req.body.code,
            name: projectName,
            public: projectPublic
        }
    };
    Project.updateOne(filter, updateDocument)
        .exec()
        .then(() => {
            return res.status(200).json({
                message: 'Project updated.'
            });
        })
        .catch((err) => {
            return res.status(500).json({
                message: err.message
            });
        });
};

const newProject = (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.jwt.userId;

    User.find({ _id: userId })
        .exec()
        .then((users) => {
            // logging.info(NAMESPACE, 'Token Valid');
            // console.log(req.body.code.split('\n'));
            const userId = users[0].id;
            const projectId = new mongoose.Types.ObjectId();

            const _newProject = new Project({
                _id: projectId,
                name: req.body.project_name,
                code: req.body.code,
                user_id: userId,
                read_me: 'Read Me',
                public: false
            });

            return _newProject
                .save()
                .then((user) => {
                    return res.status(200).json({ user });
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            return res.status(500).json({
                message: err.message
            });
        });
};

const allProjects = (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.jwt.userId;
    ProfileId.find({ user_id: userId })
        .exec()
        .then((profiles) => {
            Project.find({ user_id: userId })
                .exec()
                .then((projectsFound) => {
                    return res.status(200).json({
                        projects: projectsFound,
                        profile_id: profiles[0].profile_id
                    });
                });
        })

        .catch((err) => {
            return res.status(500).json({
                message: err.message
            });
        });
};

const deleteProject = (req: Request, res: Response) => {
    console.log(req.body.projectId);
    Project.findOneAndDelete({ _id: req.body.projectId })
        .then((dbResponse) => {
            console.log(dbResponse);
            return res.status(200).json({ message: 'Project Deleted' });
        })
        .catch((err) => {
            return res.status(404).json({ message: 'Something went wrong.' });
        });
};

const publicProjects = (req: Request, res: Response) => {
    ProfileId.find({ profile_id: req.headers.id })
        .exec()
        .then((profiles) => {
            Project.find({ user_id: profiles[0].user_id, public: true })
                .exec()
                .then((unsafeProjects) => {
                    const safeProjects = unsafeProjects.map((project) => {
                        let newObj = {
                            name: project['name']
                            // code: project['code'],
                            // readme: project['read_me']
                        };
                        return newObj;
                    });

                    return res.status(200).json({
                        projects: safeProjects
                    });
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(404).json({
                        error: err
                    });
                });
        })
        .catch((err) => {
            console.log(err);
            return res.status(404).json({ error: err });
        });
};

const getPublicProject = (req: Request, res: Response) => {
    ProfileId.find({ profile_id: req.headers.profile_id })
        .exec()
        .then((profile) => {
            const userId = profile[0].user_id;

            Project.find({ user_id: userId })
                .exec()
                .then((projects) => {
                    let result = projects.filter((proj) => {
                        return proj.name.toLowerCase().split(' ').join('') === req.headers.project_name;
                    })[0];
                    const safeProject = {
                        name: result.name,
                        code: result.code,
                        readme: result.read_me
                    };
                    res.status(200).json({ project: safeProject });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(404).json({ message: 'Not found' });
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(404).json({ message: 'Not found' });
        });
    /*
        get user id using profile id. 
        get project using user id and project id. 
    */
};

const loadProject = (req: Request, res: Response, next: NextFunction) => {
    Project.find({ _id: req.headers.project_id })
        .exec()
        .then((response) => {
            return res.status(200).json({
                name: response[0].name,
                code: response[0].code
            });
        });
};

const register = (req: Request, res: Response, next: NextFunction) => {
    let { first, last, email, password } = req.body;
    User.find({ email: email.toLowerCase() })
        .exec()
        .then((users) => {
            if (users.length !== 1) {
                bcryptjs.hash(password, 10, (hashError, hash) => {
                    if (hashError) {
                        res.status(500).json({
                            message: hashError.message,
                            error: hashError
                        });
                    }

                    const newUserId = new mongoose.Types.ObjectId();
                    const _profileId = new ProfileId({
                        profile_id: generateProfileId(),
                        user_id: newUserId
                    });

                    const _user = new User({
                        _id: newUserId,
                        first: first,
                        last: last,
                        email: email.toLowerCase(),
                        password: hash
                    });

                    return _user
                        .save()
                        .then(() => {
                            _profileId.save().then(() => {
                                return res.status(201).json({ message: 'User created' });
                            });
                        })
                        .catch((err) => {
                            return res.status(500).json({
                                message: err.message,
                                err
                            });
                        });
                });
            } else {
                return res.status(409).json({ message: 'User Exists' });
            }
        })
        .catch((error) => {
            return res.status(500).json({ message: error.message, error });
        });
};

const login = (req: Request, res: Response, next: NextFunction) => {
    let { email, password } = req.body;

    User.find({ email: email.toLowerCase() })
        .exec()
        .then((users) => {
            if (users.length !== 1) {
                return res.status(401).json({ message: 'Unauthorized1' });
            }

            bcryptjs.compare(password, users[0].password, (err, result) => {
                if (result) {
                    console.log(users[0]);
                    signJWT(users[0], (jwtErr, accessToken, refreshToken) => {
                        if (jwtErr) {
                            logging.error(NAMESPACE, 'Unable to sign token', jwtErr);
                            return res.status(401).json({
                                message: 'Unauthorized',
                                error: jwtErr
                            });
                        } else if (accessToken && refreshToken) {
                            const _refresh = new Refresh_Token_List({
                                token: refreshToken
                            });

                            return _refresh
                                .save()
                                .then((user) => {
                                    return res.status(200).json({
                                        message: 'Auth Successful',
                                        accessToken,
                                        refreshToken,
                                        userData: users[0]
                                    });
                                })
                                .catch((err) => {
                                    return res.status(500).json({
                                        message: err.message,
                                        err
                                    });
                                });
                        }
                    });
                } else {
                    return res.status(401).json({ message: 'Unauthorized2' });
                }
            });
        })
        .catch((error) => {
            return res.status(500).json({ message: error.message, error });
        });
};

// returns token and user object

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
    User.find()
        .select('-password')
        .exec()
        .then((users) => {
            return res.status(200).json({
                users,
                count: users.length
            });
        })
        .catch((error) => {
            return res.status(500).json({ message: error.message, error });
        });
};
// returns each user in DB (NO PW)

const token = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Checking if refresh token is valid');

    const { email, refreshToken } = req.body;

    Refresh_Token_List.find({ token: refreshToken }).then(() => {
        res.status(200).json({ accessToken: generateAccessToken({ user: email }) });
    });
};

const deleteRefreshToken = (req: Request, res: Response, next: NextFunction) => {
    Refresh_Token_List.findOneAndDelete({ token: req.body.refreshToken })
        .then((result) => {
            return res.status(200).json({ message: 'User authorization removed' });
        })
        .catch((err) => {
            return res.status(400).json({ err });
        });
};

const home = (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ message: 'Welcome!' });
};
export default { validateToken, register, login, getAllUsers, token, deleteRefreshToken, home, saveProject, newProject, allProjects, deleteProject, loadProject, publicProjects, getPublicProject };

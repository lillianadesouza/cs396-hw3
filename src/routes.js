"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");
const FavoriteDoctor = require("./schema/FavoriteDoctor");
const FavoriteCompanion = require("./schema/FavoriteCompanion");

const express = require("express");
const router = express.Router();

const doctor404 = (res, id) => {
    res.status(404).send({
        message: `Doctor with id "${id}" does not exist in your favorites.`
    });

}
const companion404 = (res, id) => {
    res.status(404).send({
        message: `Companion with id "${id}" does not exist in your favorites.`
    });
};


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });
    
// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------


router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");
        Doctor.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /doctors");
        Doctor.create(req.body).save()
            .then(data => {
                res.status(201).send(data);
            })
            .catch(err => {
                res.status(500).send({
                    request: req.body,
                    message: `Your object should conform to this format: { name: string, seasons: Array<number> }`
                });
            });
    });

// optional:
router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        FavoriteDoctor.find({})
            .then(favorites => {
                return FavoriteDoctor.getDoctors(favorites);
            })
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            });
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        if (!req.body.doctor_id) {
            res.status(500).send({
                request: req.body,
                message: `Your object should conform to this format: { "doctor_id": <id> }, where the id is a valid Doctor id.`
            });
            return;
        }

        FavoriteDoctor
            .getFavorite(req.body.doctor_id) // first check if the doc exists:
            .then(doc => {
                if (doc) {
                    res.status(500).send({
                        request: req.body,
                        message: `Doctor "${req.body.doctor_id}" already in favorites.`
                    });
                    return;
                }

                // if it doesn't exist, create it:
                FavoriteDoctor
                    .create(req.body.doctor_id)
                    .save()
                    .then(FavoriteDoctor.getDoctor)
                    .then(data => {
                        res.status(201).send(data);
                    })
                    .catch(err => {
                        res.status(500).send({
                            request: req.body,
                            message: `Your object should conform to this format: { "doctor": <ii> }, where the id is a valid Doctor id.`
                        });
                    });
            })
            .catch(err => {
                res.status(500).send({
                    request: req.body,
                    message: `Your object should conform to this format: { "doctor": <ii> }, where the id is a valid Doctor id.`
                });
            });
        
    });

router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        Doctor.findById(req.params.id)
            .then(data => {
                if (data) {
                    res.status(200).send(data);
                } else {
                    doctor404(res, req.params.id);
                }
            })
            .catch(err => {
                doctor404(res, req.params.id);
            });
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        Doctor.findOneAndUpdate(
                { _id: req.params.id }, 
                req.body,
                { new: true }
            )
            .then(data => {
                if (data) {
                    res.status(200).send(data);
                } else {
                    doctor404(res, req.params.id);
                }
            })
            .catch(err => {
                doctor404(res, req.params.id);
            });
    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);

        Doctor.findOneAndDelete(
            { _id: req.params.id }
        )
        .then(data => {
            if (data) {
                res.status(200).send(null);
            } else {
                doctor404(res, req.params.id);
            }
        })
        .catch(err => {
            doctor404(res, req.params.id);
        });
    });

router.route("/doctors/:id/companions")
    .get((req, res) => {
        Companion.find({'doctors': {'$eq': req.params.id} })
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                doctor404(res, req.params.id);
            });
    });


router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        console.log("GET /doctors/:id/goodparent");
        // assume if all of the companions associated with 
        // the doctors end up alive, then the doctor was a good parent.
        Companion.find({
                'doctors': {'$eq': req.params.id},
                'alive': true
            })
            .then(living => {
                Companion.find({
                        'doctors': {'$eq': req.params.id}
                    }).then(all => {
                        res.status(200).send(living.length === all.length);
                    }).catch(err => {
                        res.status(404).send(err);
                    });
            })
            .catch(err => {
                doctor404(res, req.params.id);
            });
    });

// optional
router.route("/doctors/favorites/:doctor_id")
    .get((req, res) => {
        console.log(`GET /doctors/favorites/${req.params.doctor_id}`);
        FavoriteDoctor
            .findOne({"doctor": req.params.doctor_id })
            .then(favorite => {
                return Doctor.findOne({"_id": favorite.doctor})
            })
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                doctor404(res, req.params.id);
            });
    })
    .delete((req, res) => {
        console.log(`GET /doctors/favorites/${req.params.doctor_id}`);
        FavoriteDoctor
            .findOne({"doctor": req.params.doctor_id })
            .then(favorite => {
                return FavoriteDoctor.findOneAndDelete(
                    { doctor: req.params.doctor_id }
                );
            })
            .then(data => {
                res.status(200).send(null);
            })
            .catch(err => {
                doctor404(res, req.params.id);
            });
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        Companion.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");
        Companion.create(req.body).save()
            .then(data => {
                res.status(201).send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        Companion.find({
            // 'doctors': {'$size': 2}
            'doctors.1': { $exists: true }
        }).then(docs => {
            res.status(200).send(docs);
        }).catch(err => {
            res.status(404).send(err);
        });
    });

// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        FavoriteCompanion.find({})
            .then(favorites => {
                return FavoriteCompanion.getCompanions(favorites);
            })
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            });
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        if (!req.body.companion_id) {
            res.status(500).send({
                request: req.body,
                message: `Your object should conform to this format: { "companion_id": <id> }, where the id is a valid Companion id.`
            });
            return;
        }
        FavoriteCompanion
            .getFavorite(req.body.companion_id) // first check if the doc exists:
            .then(doc => {
                if (doc) {
                    res.status(500).send({
                        request: req.body,
                        message: `Companion "${req.body.companion_id}" already in favorites.`
                    });
                    return;
                }

                // if it doesn't exist, create it:
                FavoriteCompanion
                    .create(req.body.companion_id)
                    .save()
                    .then(FavoriteCompanion.getCompanion)
                    .then(data => {
                        res.status(201).send(data);
                    })
                    .catch(err => {
                        res.status(500).send({
                            request: req.body,
                            message: `Your object should conform to this format: { "companion": <id> }, where the id is a valid Companion id.`
                        });
                    });
            })
            .catch(err => {
                res.status(500).send({
                    request: req.body,
                    message: `Your object should conform to this format: { "companion": <id> }, where the id is a valid Companion id.`
                });
            });
    });

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        Companion.findById(req.params.id)
            .then(data => {
                console.log(data);
                if (data)
                    res.status(200).send(data);
                else {
                    companion404(res, req.params.id);
                }
            })
            .catch(err => {
                companion404(res, req.params.id);
            });
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        Companion.findOneAndUpdate(
            { _id: req.params.id }, 
            req.body,
            { new: true }
        )
        .then(data => {
            if (data) {
                res.status(200).send(data);
            } else {
                companion404(res, req.params.id);
            }
        })
        .catch(err => {
            companion404(res, req.params.id);
        });
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        Companion.findOneAndDelete(
            { _id: req.params.id }
        )
        .then(data => {
            if (data) {
                res.status(200).send(null);
            } else {
                companion404(res, req.params.id);
            }
        })
        .catch(err => {
            companion404(res, req.params.id);
        });
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);

        Companion.findById(req.params.id)
            .then(companion => {
                Doctor.find({
                        '_id': {'$in': companion.doctors}
                    }).then(docs => {
                        res.status(200).send(docs);
                    }).catch(err => {
                        res.status(404).send(err);
                    });
            })
            .catch(err => {
                companion404(res, req.params.id);
            });
    });

router.route("/companions/:id/friends")
    .get((req, res) => {
        /**
         * A list of the companions who appeared on at 
         * least one of the same seasons as this 
         * companion.
         *  */
        console.log(`GET /companions/${req.params.id}/friends`);

        Companion.findById(req.params.id)
            .then(companion => {
                Companion.find({
                        'seasons': {'$in': companion.seasons},
                        '_id': { '$ne': req.params.id }
                    }).then(docs => {
                        res.status(200).send(docs);
                    }).catch(err => {
                        res.status(404).send(err);
                    });
            })
            .catch(err => {
                companion404(res, req.params.id);
            });
    });

router.route("/companions/favorites/:companion_id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.companion_id}`);
        FavoriteCompanion
            .findOne({"companion": req.params.companion_id })
            .then(favorite => {
                return Companion.findOne({"_id": favorite.companion})
            })
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                companion404(res, req.params.id);
            });
    })
    .delete((req, res) => {
        console.log(`GET /companions/favorites/${req.params.companion_id}`);
        FavoriteCompanion
            .findOne({"companion": req.params.companion_id })
            .then(favorite => {
                return FavoriteCompanion.findOneAndDelete(
                    { companion: req.params.companion_id }
                );
            })
            .then(data => {
                if (data) {
                    res.status(200).send(null);
                } else {
                    companion404(res, req.params.id);
                }
            })
            .catch(err => {
                companion404(res, req.params.id);
            });
    });


module.exports = router;

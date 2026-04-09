const { Service } = require('feathers-mongodb');

exports.Uploads = class Uploads extends Service {
    constructor (options, app) {
        super(options)
        app.get('mongoClient').then(db => {
            this.Model = db.collection('uploads')
        })
    }
};

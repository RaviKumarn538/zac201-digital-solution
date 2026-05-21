const Joi = require('joi');

module.exports.listingschema = Joi.object({
    listing : Joi.object({
        title: Joi.String().required(),
        description: Joi.String().required(),
        location: Joi.String().required(),
        price: Joi.number().required().min(0),
    city: Joi.String().required(),
    image: Joi.String().allow("" , null),
    }).required()
})
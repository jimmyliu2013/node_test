var mongoose = require('mongoose');

var itemSchema = mongoose.Schema({
id: Number,
title: String,
description: String,
iconSrc: String,
contentSrc: String,
soundSrc: String,
});


var Item = mongoose.model('Item', itemSchema);
module.exports = Item;

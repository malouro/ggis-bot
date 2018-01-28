#!/usr/bin/env coffee

RSS = require 'rss'
escape = require 'escape-html'
request = require 'request'

API_ENDPOINT = 'https://api.imgur.com/3/'

get = (clientId, path, query, cb) ->
  request {
    url: API_ENDPOINT + path
    method: 'get'
    qs: query
    json: true
    headers:
      Authorization: "Client-ID #{ clientId }"
  }, cb

exports.album2rss = (clientId, albumId, cb) ->
  return cb "Must specify a client ID" unless clientId
  return cb "Must specify an album ID" unless albumId

  get clientId, "album/#{ albumId }", null, (err, res, body) ->
    return cb err if err
    return cb String(body?.data?.error) unless body?.success

    feed = new RSS(title: body.data.title, site_url: body.data.link, generator: 'imgur2rss')

    body.data.images.sort (a, b) -> a.datetime - b.datetime

    for image in body.data.images
      feed.item
        title: image.title ? image.id
        url: "http://imgur.com/#{ image.id }"
        date: new Date(image.datetime * 1000)
        description: """<img src="#{ image.link }" alt="#{ image.title ? image.id }"/>"""

    cb null, feed.xml(indent: true)

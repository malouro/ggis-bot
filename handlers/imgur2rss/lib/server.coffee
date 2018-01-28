#!/usr/bin/env coffee

express = require 'express'

i2r = require './imgur2rss.coffee'

# TODO: Possibly require a secret query parameter to prevent abuse.

clientId = process.env.IMGUR_CLIENT_ID
throw new Error("Missing IMGUR_CLIENT_ID env var") unless clientId

app = express()

app.get '/a/:albumId', (req, res) ->
  i2r.album2rss clientId, req.params.albumId, (err, xml) ->
    if err
      res.status(400).send("Error: #{ err }")
    else
      res.set('Content-Type', 'application/rss+xml').send(xml)

port = process.env.PORT ? 3000
server = app.listen port, ->
  {address, port} = server.address()
  console.log "Listening at http://#{ address }:#{ port }"

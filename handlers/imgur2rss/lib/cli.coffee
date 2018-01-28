#!/usr/bin/env coffee

commander = require 'commander'

i2r = require './imgur2rss.coffee'

commander
  .version(require('../package.json').version)
  .option('-c, --client-id <clientId>', "Imgur registered app client ID")

commander
  .command('album <albumId>')
  .description('Print an RSS feed for an Imgur album')
  .action (albumId, options) ->
    i2r.album2rss options.parent.clientId, albumId, (err, xml) ->
      if err
        console.error "Error: #{ err }"
        process.exit 1
      else
        console.log xml

commander.parse process.argv
commander.help() unless commander.args.length

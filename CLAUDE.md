# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

nug2.0 is a Discord bot built on discord.js v14 (CommonJS, plain JavaScript). It serves one guild with slash commands and also reacts passively to messages. `package.json` defines no scripts, tests or linter.

## Commands

```bash
npm install                  # canvas, sqlite3 and heic-convert are native modules
node deploy-commands.js      # register slash commands with the guild in config.json
node index.js                # run the bot (pm2 is a dependency for running it in production)
```

You must rerun `deploy-commands.js` whenever you add a command, remove one, or change a command's `data` (name, description or options). Changes inside `execute` only need a bot restart.

## Configuration

- `config.json` is gitignored. Use `config.example` as the template, but it lists only some of the keys the code reads. The full set is: `token`, `clientId`, `guildId`, `wolframID`, `wolframAPI`, `imgFlipUser`, `imgFlipPass`, `bingServiceKey`, `alphaVantageKey` and `braveApiKey`. Modules load keys directly with `require('../config.json')`.
- `discordusers.json` maps nicknames to Discord user IDs (for example `doomID`). `events/messageCreate.js` destructures it.
- Some IDs are hardcoded: the emoji announcement channel in `events/emojiCreate.js`, an ignored user ID in `messageCreate.js`, and an Uptime Kuma push URL on the LAN (`kumaCheckin` in `index.js`, sent every 59s).

## Architecture

- **Dynamic loading:** `index.js` and `deploy-commands.js` both scan `commands/<category>/*.js`, one directory level deep. Each command module exports `{ data: SlashCommandBuilder, execute(interaction) }`, and a file missing either export is skipped with a warning. To add a command, drop a file into a category folder (`fun/` or `utility/`). No registration list needs editing. `help.js` builds its output from `client.commands`.
- **Events:** each `events/*.js` file exports `{ name, once?, execute }` and is wired up automatically. `interactionCreate.js` dispatches slash commands and owns the generic error reply. `messageCreate.js` handles non-command behavior on every message: it upserts the `seen` table, adds keyword reactions, and converts HEIC attachments to JPEG.
- **Shared helpers:** reusable code lives in `functions/`, including image search (`braveImageSearch.js` replaced `bingImageSearch.js`, but both are still used), URL validation and `convertMS`.
- **SQLite (two DBs in `db/`, both gitignored):**
  - `seen.sqlite`: `messageCreate.js` and `commands/utility/seen.js` each open their own connection via a path relative to `__dirname`.
  - `doomsux.sqlite` (table `doomsuxes`): accessed through `db/dbConnector.js`, which also exports a `seendb` connection.
  - `dbConnector.js` resolves the entries in `paths.json` relative to the repo root, so keep them relative (e.g. `db/doomsux.sqlite`) and don't use absolute paths.
- The code imports `SlashCommandBuilder` from both `discord.js` and `@discordjs/builders`. The latter is only a transitive dependency.

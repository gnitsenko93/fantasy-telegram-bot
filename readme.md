# Fantasy Football bot for Telegram

## Installation

1. Install dependencies via npm.

`npm install`

2. Add a bot token to `config/development.json`. Note that the file is added to `.gitignore` to prevent a token compromising.

```
{
    "token": "<secret>"
}
```
3. Override MongoDB connection options in the same place at `config/development.json`.

## Running

Use npm script to run an application.

`npm start`

## Usage

A list of supported commands is available in [changelog](/changelog.md).
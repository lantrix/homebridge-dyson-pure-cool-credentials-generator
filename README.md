# Dyson homebridge-dyson-pure-cool credentials generator

Code copied from @lukasroegner [credentials-generator-website.js](https://github.com/lukasroegner/homebridge-dyson-pure-cool/blob/master/src/credentials-generator-website.js)

## Get an API token and Account ID

Use https://github.com/lantrix/libdyson-neon/tree/bearer-token to get the Bearer token.

```shell
gh repo clone lantrix/libdyson-neon
cd libdyson-neon
git checkout bearer-token
python -m venv .venv
source .venv/bin/activate
pip3 install -r requirements.txt
python get_devices.py
```

Get value for _Account ID_

Get value for _Bearer Token_

## Populate API details

Edit in this repo `.env` with the above two values as shown, using your values:

```ini
DYSON_ACCOUNTID="b45790f0-26cd-40ab-a359-e20b48be3290"
DYSON_API_TOKEN="OKDCBCXUWKTZSXWRIC6Q1QGYW1OMYSO95ZF2BHVIC0N1JU3X1OPJQEEF8AC8OFD0-1"
```

## Generate credentials object for [homebridge-dyson-pure-cool](https://github.com/lukasroegner/homebridge-dyson-pure-cool)

- Install _node.js_ (tested with `v18`)
- Install [`pnpm`](https://pnpm.io/installation)
  - for example with _npm_: `npm install -g pnpm`
- Install dependencies:  `pnpm install`
- Start the web app: `pnpm start`

Access http://localhost:8089 to view your `homebridge-dyson-pure-cool` credentials object.

Tested successfully with `homebridge-dyson-pure-cool` [`2.7.5`](https://www.npmjs.com/package/homebridge-dyson-pure-cool/v/2.7.5) with one Dyson device on the account.

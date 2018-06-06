# Fruitlet Smart Home

Requirements
* nodejs
* pm2 (npm install -g pm2)

# Installation
```
git clone https://github.com/afonsof/fruitlet-smart-home.git
cd fruitlet-smart-home
npm install
```

# Setting up the config file
* Copy the file `config.yml.sample` and rename it to `config.yml`
* Edit it and insert your devices and batch actions


## Running the Internet agent
Designed and tested to run in a Ubunto machine
```
npm run install-internet-agent
```

## Running the Intranet agent
Designed to run inside a raspberry pi machine
```
npm run install-internet-agent
```

const deviceTypesEnum = {
    light: 'light',
    mediaPlayer: 'media-player'
};

module.exports = {
    enum: deviceTypesEnum,
    commands: {
        [deviceTypesEnum.light]: ['power-on', 'power-off'],
        [deviceTypesEnum.mediaPlayer]: ['power-on', 'power-off', 'set-volume', 'set-source']
    }
};
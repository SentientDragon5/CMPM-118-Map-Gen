
// Phaser: 3.70.0
"use strict"

var canvas_x = 600;
var canvas_y = 400;

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true 
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: canvas_x,
    height: canvas_y,
    fps:30,
    scene: [Game],
    audio: {
        disableWebAudio: true
    }
}

var cursors;
const SCALE = 0.1;
const PPU = 16;
var my = {sprite: {}, text: {}};
var world=0;
var respawnX=0;
var respawnY=0;
var score = 0;
var deaths = 0;

const game = new Phaser.Game(config);
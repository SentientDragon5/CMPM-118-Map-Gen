
class Game extends Phaser.Scene {
    constructor() {
        super("game");
    }

    init() {

        // Load tilemap information
        this.load.image("tilemap_packed", "monochrome_tilemap_transparent_packed.png");

        this.load.spritesheet("tilemap_sheet", "monochrome_tilemap_transparent_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });
    }


    preload() {
        // get assets
        this.load.path = "./assets/"
        this.load.image("tilesheet", "map/kenneymap.png")
    }

    create() {
        let a= this.getRandomInt(188)
        const lvl = [
            [a,a,a,0,0],
            [0,0,0,0,0],
            [0,0,a,2,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0]
        ]

        const map = this.make.tilemap({
            data: lvl,      // load direct from array
            tileWidth: 16,
            tileHeight: 16
        })
        const tilesheet = map.addTilesetImage("tilesheet")
        const layer = map.createLayer(0, tilesheet, 0, 0)

        this.input.keyboard.on('keydown-R', () => {
            this.scene.start("game")
        }, this);
        // this.cameras.main.setBounds(0, 0, PPU*mapW*SCALE, PPU*mapH*SCALE);
    }
    // generate a random number between 0 and max
    getRandomInt(max) {
        return Math.floor(Math.random() * max)
    }

    update() {
    }
}
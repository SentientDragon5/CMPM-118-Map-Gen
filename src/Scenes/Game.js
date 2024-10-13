
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
        let w = 5;
        let h = 5;

        let scale = 1

        let a= this.getRandomInt(188)
        var lvl = [
            [a,a,a,0,0],
            [0,0,0,0,0],
            [0,0,a,2,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0]
        ]


        noise.seed(Math.random());

        for (var x = 0; x < w; x++) {
          for (var y = 0; y < h; y++) {
            // All noise functions return values in the range of -1 to 1.
        
            // noise.simplex2 and noise.perlin2 for 2d noise
            var value = noise.perlin2(x / 100, y / 100);
            lvl[x][y] = value * 188
            //image[x][y].r = Math.abs(value) * 256; // Or whatever. Open demo.html to see it used with canvas.
          }
        }


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

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

    eval_tile(){
        
    }

    create() {
        let w = 200;
        let h = 200;
        let scale = 0.1
        var lvl = []
        var raw = []

        let tiles = [70, 105, 165, 40 ,50]

        noise.seed(Math.random());

        for (var x = 0; x < w; x++) {
            let row = []
            let raw_row = []
          for (var y = 0; y < h; y++) {
            // All noise functions return values in the range of -1 to 1.
            var value = noise.perlin2(x * scale, y * scale);
            var value = (value + 1)/2
            var index = Math.floor(value*4)
            raw_row.push(Math.floor(value*100))
            row.push(tiles[index])
            //value*188/2+188/2
          }
          lvl.push(row)
            console.log(raw_row)  
          //raw.push(raw_row)
        }
        //console.log(raw)

        const map = this.make.tilemap({
            data: lvl,
            tileWidth: 64,
            tileHeight: 64
        })
        const tilesheet = map.addTilesetImage("tilesheet")
        var layer = map.createLayer(0, tilesheet, 0, 0)
        layer.setScale(SCALE)
        
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
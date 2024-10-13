
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
    
    // value is 0-1
    eval_tile(value){
        // water
        // clay
        // stone
        // grass
        // snow
        let tiles = [70,70,70, 105, 40,40,40, 165,50,50]


        // https://www.desmos.com/calculator/4sz3lhfc4f
        var curved = (Math.cbrt(value-0.5)+1)/2

        var index = Math.floor(curved*tiles.length)
        var tile = tiles[index]
        return tile
    }

    create() {
        let scale = 0.1
        let step = 0.01
        let seed = Math.random()

        this.input.keyboard.on('keydown-R', () => {
            seed = Math.random()
            this.makeMap(seed, scale)
        }, this);

        this.input.keyboard.on('keydown-PERIOD', () => {
            scale -= step
            this.makeMap(seed, scale)
        }, this);

        this.input.keyboard.on('keydown-COMMA', () => {
            scale += step
            this.makeMap(seed, scale)
        }, this);

        this.makeMap(seed,scale)
    }
    
    makeMap(seed, scale=0.1){
        let w = 100;
        let h = 100;
        var lvl = []

        noise.seed(seed);

        for (var x = 0; x < w; x++) {
            let row = []
            let raw_row = []
          for (var y = 0; y < h; y++) {
            // All noise functions return values in the range of -1 to 1.
            var value = noise.perlin2(x * scale, y * scale);
            var value = (value + 1)/2
            raw_row.push(Math.floor(value*100))
            row.push(this.eval_tile(value))
            //value*188/2+188/2
          }
          lvl.push(row)
            console.log(raw_row)
        }

        const map = this.make.tilemap({
            data: lvl,
            tileWidth: 64,
            tileHeight: 64
        })
        const tilesheet = map.addTilesetImage("tilesheet")
        var layer = map.createLayer(0, tilesheet, 0, 0)
        layer.setScale(SCALE)
    }

    
    // generate a random number between 0 and max
    getRandomInt(max) {
        return Math.floor(Math.random() * max)
    }

    update() {
    }
}
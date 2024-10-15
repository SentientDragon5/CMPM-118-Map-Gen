
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
        // water 70
        // clay 105
        // stone 40
        // grass 165
        // snow 50
        var water = {
            "name" : "water",
            "type" : "no_edges",
            "tile" : 70,
            "edge" : []
        }
        // Format: center, 
        // up, up right, right, down right,
        // down, down left, left, up left,
        // inner
        // up right, down right, down left
        // up left
        
        var grass = {
            "name" : "grass",
            "type" : "edges",
            "tile" : 40,
            "out_edge" : [
                [69,55,41],
                [40,40,26],
                [24,25,11]],
            "in_edge" : [
                [27,13],
                [12,193]
            ]
        }
        
        let tiles = [70, 40, 165]


        // Old
        // https://www.desmos.com/calculator/4sz3lhfc4f
        // var curved = (Math.cbrt(value-0.5)+1)/2

        // New atan curve
        var u = 6.9
        var v = 0.38
        var curved = v * Math.atan(u * (value - 0.5)) + 0.5
        
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
        let w = 20;
        let h = 20;
        var lvl = []

        let is_debug_map = true;
        if (is_debug_map){
            w = 14;
            h = 14;
        }

        noise.seed(seed);

        for (var x = 0; x < w; x++) {
            let row = []
            let raw_row = []
          for (var y = 0; y < h; y++) {
            // All noise functions return values in the range of -1 to 1.
            var value = noise.perlin2(x * scale, y * scale);
            var value = (value + 1)/2 // remap to 0 to 1
            
            if(is_debug_map){
                raw_row.push(x*14 + y)
                row.push(x*14 + y) // for every tile
            }
            else{
                raw_row.push(Math.floor(value*100))
                row.push(this.eval_tile(value))
            }
            
          }
          lvl.push(row)
            console.log(raw_row)
        }

        if (!is_debug_map){
            lvl = this.genBorders(lvl,w,h);
        }

        const map = this.make.tilemap({
            data: lvl,
            tileWidth: 64,
            tileHeight: 64
        })
        const tilesheet = map.addTilesetImage("tilesheet")
        var layer = map.createLayer(0, tilesheet, 0, 0)
        layer.setScale(SCALE)

        if (is_debug_map){
            for (var x = 0; x < w; x++) {
                for (var y = 0; y < h; y++) {
                  let size = 32
                  this.add.text(x*size,y*size, ""+(y*14 + x), {
                      "fontSize" : 8,
                      "backgroundColor" : "000000"
                  })
                }
              }
        }
    }

    genBorders(lvl,w,h){
        let borderLvl = []; // Initialize an empty array for border tiles

        let NO_TILE = -1;

        borderLvl.push(Array(w).fill(NO_TILE));//pad
        for (let x = 1; x < w - 1; x++) {
            let borderRow = [];
            borderRow.push(NO_TILE); //pad
            for (let y = 1; y < h - 1; y++) {
                let currentTile = lvl[x][y];
                let neighbors = [
                    lvl[x][y - 1],  // Top
                    lvl[x][y + 1],  // Bottom
                    lvl[x - 1][y],  // Left
                    lvl[x + 1][y]   // Right
                ];
    
                if (neighbors.some(neighbor => neighbor !== currentTile)) {
                    borderRow.push(1); // Replace with your logic for selecting the border tile
                } else {
                    borderRow.push(NO_TILE); // Use -1 to indicate no border tile
                }
            }
            borderRow.push(NO_TILE);//pad
            borderLvl.push(borderRow);
        }
        borderLvl.push(Array(w).fill(NO_TILE));//pad

        for (let x=0; x<w; x++){
            for(let y=0; y<h; y++){
                if (borderLvl[x][y] != NO_TILE){
                    lvl[x][y] = borderLvl[x][y];
                }
            }
        }

        return lvl
    }

    
    // generate a random number between 0 and max
    getRandomInt(max) {
        return Math.floor(Math.random() * max)
    }

    update() {
    }
}
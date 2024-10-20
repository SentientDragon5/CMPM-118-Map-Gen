
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
        
        this.load.image("player", "mapTile_137.png");
    }
    
    // value is 0-1
    eval_tile(value){
        // water 70
        // clay 105
        // stone 40
        // grass 165
        // snow 50
        
        this.tile_order = [0,1,2,3]


        // Old
        // https://www.desmos.com/calculator/4sz3lhfc4f
        // var curved = (Math.cbrt(value-0.5)+1)/2

        // New atan curve
        var u = 6.9
        var v = 0.38
        var curved = v * Math.atan(u * (value - 0.5)) + 0.5
        
        var index = Math.floor(curved*this.tile_order.length)
        var tile = this.tile_order[index]
        return tile
    }

    create() {
        this.maps = [];
        this.locations = [];
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

        my.sprite.player = this.add.sprite(0, 0, "player");
        my.sprite.player.scale = 0.5;
        my.sprite.player.depth = 100;
    }
    
    makeMap(seed, scale=0.1){
        // clean up old
        this.maps.forEach(element => {
            element.destroy();
        });
        this.locations.forEach(element => {
            element.destroy();
        });

        let w = 32;
        let h = 32;
        var lvl = []

        let is_debug_map = false;
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
        }

        if(!is_debug_map){
            var groups = this.findTileGroups(lvl);
            groups.forEach(element => {
                var type = element[0]
                var center = element[1]
                var size = 16;
                var name = this.genName(type,center[2]);
                var text = this.add.text(Math.floor(center[1]*size),Math.floor(center[0]*size), name, {
                    "fontSize" : 8,
                    "backgroundColor" : "000000"
                })
                text.depth = 1;
                this.locations.push(text);
                console.log(center)
            });
            console.log(groups)
        }

        let lvls = [lvl]
        if (!is_debug_map){
            lvls = this.genBorders(lvl,w,h);
        }


        lvls.forEach(l => {
            const map = this.make.tilemap({
                data: l,
                tileWidth: 64,
                tileHeight: 64
            })
            const tilesheet = map.addTilesetImage("tilesheet")
            var layer = map.createLayer(0, tilesheet, 0, 0)
            layer.setScale(SCALE);
            this.maps.push(layer);
        });

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

        var tileTypes = {
            0 : {
                "name" : "water",
                "type" : "no_edges",
                "tile" : 70
            },
            1 : {
                "name" : "sand",
                "type" : "edges",
                "tile" : 110,
                "out_edge" : [
                    42,28,14,
                    124,110,96,
                    94,80,81
                ]
            },
            2 : {
                "name" : "grass",
                "type" : "edges",
                "tile" : 40,
                "out_edge" : [
                    69,55,41,
                    40,40,26,
                    24,25,11],
                "in_edge" : [
                    27,13,
                    12,193
                ]
            },
            3 : {
                "name" : "snow",
                "type" : "edges",
                "tile" : 50,
                "out_edge" : [
                    79,65,51,
                    64,50,36,
                    49,20,21
                ]
            }
        } 
        // Format: center, 
        // up, up right, right, down right,
        // down, down left, left, up left,
        // inner
        // up right, down right, down left
        // up left

        let borderLvl = []; // Initialize an empty array for border tiles

        let NO_TILE = 195;

        borderLvl.push(Array(w).fill(NO_TILE));//pad
        for (let x = 1; x < w - 1; x++) {
            let borderRow = [];
            borderRow.push(NO_TILE); //pad
            for (let y = 1; y < h - 1; y++) {
                let currentTile = lvl[x][y];
                //console.log(currentTile, " ", currentTile in tileTypes);
                if (!(currentTile in tileTypes)){
                    borderRow.push(NO_TILE);
                    continue;
                }
                
                let tile_info = tileTypes[currentTile];
                //console.log(tile_info)
                if (tile_info["type"] == "no_edges"){
                    borderRow.push(NO_TILE);
                    continue;
                }

                let neighbors = [
                    lvl[x][y - 1],  // Top
                    lvl[x - 1][y],  // Left
                    lvl[x + 1][y],   // Right
                    lvl[x][y + 1]  // Bottom
                ];
    
                if (neighbors.some(neighbor => neighbor !== currentTile)) {
                    var tile = 182;
                    tile = tile_info["out_edge"][4]
                    if (neighbors[2] < currentTile){
                        tile = 72;
                        tile = tile_info["out_edge"][7];
                    } else if (neighbors[1] < currentTile){
                        tile = 29;
                        tile = tile_info["out_edge"][1];
                    } else if (neighbors[0] < currentTile){
                        tile = 1;
                        tile = tile_info["out_edge"][3];
                    } else if (neighbors[3] < currentTile){
                        tile = 15;
                        tile = tile_info["out_edge"][5];
                    }
                    borderRow.push(tile); // Replace with your logic for selecting the border tile
                } else {
                    borderRow.push(NO_TILE); // Use -1 to indicate no border tile
                }
            }
            borderRow.push(NO_TILE);//pad
            borderLvl.push(borderRow);
        }
        borderLvl.push(Array(w).fill(NO_TILE));//pad

        // for (let x=0; x<w; x++){
        //     for(let y=0; y<h; y++){
        //         if (borderLvl[x][y] != NO_TILE){
        //             lvl[x][y] = borderLvl[x][y];
        //         }
        //     }
        // }
        for (let x=0; x<w; x++){
            for(let y=0; y<h; y++){
                let currentTile = lvl[x][y];
                if(borderLvl[x][y] != NO_TILE){
                    
                    if(currentTile == 1){
                        currentTile = 0
                    } else if(currentTile == 2){
                        currentTile = 1
                    } else if(currentTile == 3){
                        currentTile = 2
                    }
                }
                lvl[x][y] = tileTypes[currentTile]["tile"]
            }
        }
        
        return [lvl,borderLvl];
    }

    genName(type) {
        const prefixes = {
          0: ["Blue", "Deep", "Coral", "Silver", "Jade", "Mystic", "Azure", "Crystal", "Oceanic", "Whispering"],
          1: ["Dune", "Golden", "Sandy", "Sunken", "Whispering", "Ancient", "Lost", "Ember", "Scarlet", "Windswept"],
          2: ["Emerald", "Vast", "Rolling", "Whispering", "Golden", "Sunlit", " Verdant", "Serene", "Painted", "Flourishing"],
          3: ["Jagged", "Towering", "Skyreach", "Ancient", "Misty", "Frostbite", "Iron", "Stone", "Shadow", "Sunstone"]
        };
      
        const suffixes = {
          0: ["Ocean", "Sea", "Lake", "River", "Bay", "Lagoon", "Falls", "Currents", "Depths", "Tides"],
          1: ["Dunes", "Sands", "Desert", "Beach", "Shores", "Oasis", "Mesa", "Canyon", "Plains", "Expanse"],
          2: ["Plains", "Fields", "Meadows", "Prairie", "Savanna", "Steppe", "Valley", "Grasslands", "Expanse", "Vista"],
          3: ["Mountains", "Peaks", "Highlands", "Ridge", "Cliff", "Summit", "Pass", "Valley", "Crag", "Massif"]
        };
      
        // Generate a random prefix
        const randomPrefix = prefixes[type][Math.floor(Math.random() * prefixes[type].length)];
      
        // Generate a random suffix
        const randomSuffix = suffixes[type][Math.floor(Math.random() * suffixes[type].length)];
      
        // Combine to create the name
        const name = `${randomPrefix} ${randomSuffix}`;
      
        return name;
      }

    findTileGroups(grid) {
        const numRows = grid.length;
        const numCols = grid[0].length;
        const visited = new Array(numRows).fill(0).map(() => new Array(numCols).fill(false));
        const groups = [];
      
        for (let row = 0; row < numRows; row++) {
          for (let col = 0; col < numCols; col++) {
            if (!visited[row][col]) {
              const tileType = grid[row][col];
              const group = this.exploreGroup(grid, visited, row, col, tileType);
              groups.push([tileType, this.calculateCenter(group)]);
            }
          }
        }
      
        return groups;
      }
      
    exploreGroup(grid, visited, row, col, tileType) {
        if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length || visited[row][col] || grid[row][col] !== tileType) {
          return [];
        }
      
        visited[row][col] = true;
        const group = [[row, col]];
      
        // Explore adjacent cells
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
          group.push(...this.exploreGroup(grid, visited, row + dr, col + dc, tileType));
        }
      
        return group;
      }
      
    calculateCenter(group) {
        let sumRows = 0;
        let sumCols = 0;
        const size = group.length; // Calculate the size of the group
      
        for (const [row, col] of group) {
          sumRows += row;
          sumCols += col;
        }
        return [sumRows / size, sumCols / size, size]; // Return center coordinates and size
      }

    // generate a random number between 0 and max
    getRandomInt(max) {
        return Math.floor(Math.random() * max)
    }

    update() {
        this.moveSpeed = 5;

        let dx = (this.input.keyboard.addKey('A').isDown ? -1 : 0
            + this.input.keyboard.addKey('D').isDown ? 1 : 0) * this.moveSpeed;
        let dy = (this.input.keyboard.addKey('W').isDown ? -1 : 0
        + this.input.keyboard.addKey('S').isDown ? 1 : 0) * this.moveSpeed;
        my.sprite.player.x += dx;
        my.sprite.player.y += dy;
        console.log(my.sprite.player.x, my.sprite.player.y);
        if(dx < -0.1) my.sprite.player.flipX = true;
        if(dx > 0.1)  my.sprite.player.flipX = false;
    }
}
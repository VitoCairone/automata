// iteration 0: terminal only

// conventions:
//  i is always a left-to-right moving index
//  j is always a top-to-bottom moving index
//  n_i is the size of the grid horizontally
//  n_j is the size of the grid vertically

// getCellAt saves us from bugs if we forget
// whether i or j is the outer array (it's j)
// or, if for some reason it changes later,
// i.e. we linearize to one non-nested array.
function getGridCellAt(grid, i, j) {
    return grid.cells[j][i];
}

function createGrid(n_i, n_j, fnGridConstructor) {
    const grid = {
        n_i: n_i,
        n_j: n_j,
        cells: []
    }
    let useGridConstructor = fnGridConstructor;

    // if no constructor was provided, use this default
    if (!useGridConstructor) {
        useGridConstructor = (i, j) => { return 0 };
    }

    for (var j = 0; j < n_j; j++) {
        const row = [];
        for (var i = 0; i < n_i; i++) {
            const cell = useGridConstructor(i, j);
            row.push(cell);
        }
        grid.cells.push(row);
    }

    return grid;
}

function showGrid(grid) {
    for (var j = 0; j < grid.n_j; j++) {
        let rowStr = ""
        for (var i = 0; i < grid.n_i; i++) {
            rowStr += "["
                + (getGridCellAt(grid, i, j).age || " ")
                + "]"
        }
        console.log(rowStr);
    };
}

function createCell(i, j) {
    return {
        i: i,
        j: j,
        age: 0,
        neighbors: []
    }
}

function forAllCells(grid, fnActionOnCell) {
    grid.cells.forEach(row => {
        row.forEach(cell => { fnActionOnCell(cell) })
    });
}

// takes a grid and, for every cell, assigns its neighbors,
// as an array of 3, 5, or 8 pointers to other cell objects
function assignNeighbors(grid) {
    // neighbors don't change over time, so do this once
    forAllCells(grid, cell => {
        const shifts = [
            [-1,-1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1]
        ];

        let neighbors = shifts.map(shift => [shift[0] + cell.i, shift[1] + cell.j]);
        neighbors = neighbors.filter(nei => {
            return nei[0] >= 0 && nei[1] >= 0 && nei[0] < grid.n_i && nei[1] < grid.n_j;
        });
        neighbors = neighbors.map(nei => getGridCellAt(grid, nei[0], nei[1]))
        cell.neighbors = neighbors;
    })
}

function evolutionRule(cell) {
    let nNeighbors;
    switch (cell.age) {
        case 0: //empty
            // empty + exactly 2 adult neighbors
            const nAdultNeighbors = cell.neighbors.filter(nei => nei.age === 2).length;
            if (nAdultNeighbors === 2) {
                return 1; // Reproduction
            }
            return 0; // No change
        case 1: // newborn
            nNeighbors = cell.neighbors.filter(nei => nei.age !== 0).length;
            if (nNeighbors >= 5) {
                return 0; // Overcrowding
            } else if (nNeighbors <= 1) {
                return 0; // Isolation
            } else {
                return 2; // Growing up
            }
        case 2: // adult
            nNeighbors = cell.neighbors.filter(nei => nei.age !== 0).length;
            if (nNeighbors >= 3) {
                return 0; // Overcrowding
            } else if (nNeighbors == 0) {
                return 0; // Isolation
            } else {
                return 3; // Aging
            }
        case 3: // senior
            return 0; // Natural Causes
    }
}

function runEvolution(grid) {
    forAllCells(grid, cell => cell.future = evolutionRule(cell));
    forAllCells(grid, cell => cell.age = cell.future);
}

// this is a manual function for now to input non-zero vals,
// prefer to read data blocks directly if possible
// seedVals format: [[i, j, age], [i2, j2, age2], ...]
function seedGrid(grid, seedVals) {
    seedVals.forEach(sV => getGridCellAt(grid, sV[0], sV[1]).age = sV[2]);
}

function printEvolutions(n_i, n_j, seedVals, maxGeneration) {
    const grid = createGrid(n_i, n_j, createCell);
    assignNeighbors(grid); // todo: make createGrid call this instead
    seedGrid(grid, seedVals);

    console.log("===== Generation 1 =====");
    showGrid(grid);
    for (var gen = 2; gen <= maxGeneration; gen++) {
        runEvolution(grid);
        console.log("===== Generation " + gen + " =====");
        showGrid(grid);
    }
}

printEvolutions(5, 5,
    [
        [2,0,1], [2,1,1], [3,1,1], [1,2,2], [2,2,2], [3,2,1], [3,3,1]
    ]
, 2)

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

    assignNeighbors(grid);

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

function showGridAs2dArr(grid) {
    const ageOnly2dArr = grid.cells.map(row => row.map(cell => cell.age));

    // this is the nested array we need, but JSON.stringify doesn't give us
    // nice linebreaks so we can actually see, so still print manually.

    // also, in order to output strings which can be directly read as JSON,
    // we need to ensure no trailing commas, which is why we join arrays here
    // instead of just building a string

    let outStr = "[\n";
    const rowStrs = ageOnly2dArr.map(row => {
        return "   [" + row.map(age => "" + age).join(",") + "]"
    });
    outStr += rowStrs.join(",\n")
    outStr += "\n]";
    console.log(outStr);
}

function createGridFromString(gridStr) {
    const gridAges = JSON.parse(gridStr);
    let n_j = gridAges.length;
    let n_i = gridAges[0].length;

    const grid = createGrid(n_i, n_j, createCell);

    forAllCells(grid, cell => cell.age = gridAges[cell.j][cell.i]);

    return grid;
}

function createCell(i, j) {
    return {
        i: i,
        j: j,
        age: 0,
        neighbors: []
    };
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
    seedGrid(grid, seedVals);

    console.log("===== Generation 1 =====");
    // showGrid(grid);
    showGridAs2dArr(grid);
    for (var gen = 2; gen <= maxGeneration; gen++) {
        runEvolution(grid);
        console.log("===== Generation " + gen + " =====");
        // showGrid(grid);
        showGridAs2dArr(grid);
    }
}

function areGridsEqual(gridA, gridB) {
    if (gridA.n_i != gridB.n_i || gridA.n_j != gridB.n_j) return false;
    for (var j = 0; j < gridA.n_j; j++) {
        for (var i = 0; i < gridA.n_i; i++) {
            if (getGridCellAt(gridA, i, j).age !== getGridCellAt(gridB, i, j).age) {
                return false;
            }
        }
    }
    return true;
}

function runTests() {
    const testCase1Before = `
    [
      [0,0,2,2,0,0,0,0,0,0],
      [0,0,0,0,1,3,1,0,0,0],
      [0,0,0,2,0,3,0,0,1,3],
      [0,0,0,0,1,3,0,0,0,3],
      [0,2,2,0,0,0,1,3,1,0],
      [0,0,0,0,0,2,2,0,0,0],
      [0,0,2,0,2,0,0,0,0,0],
      [0,0,0,0,2,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0]
    ]
    `
    const testCase1After = `
    [
      [0,0,3,3,0,0,0,0,0,0],
      [0,0,0,0,2,0,2,0,0,0],
      [0,0,0,3,0,0,0,0,2,0],
      [0,1,0,1,2,0,0,0,0,0],
      [0,3,3,0,0,1,2,0,2,0],
      [0,0,0,0,1,0,0,0,0,0],
      [0,0,0,0,3,0,1,0,0,0],
      [0,0,0,0,3,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0]
    ]
    `

    const testCase1AfterAltered = `
    [
      [0,0,3,3,0,0,0,0,0,0],
      [0,0,0,0,2,0,2,0,0,0],
      [0,0,0,3,0,0,0,0,2,0],
      [0,1,0,1,1,0,0,0,0,0],
      [0,3,3,0,0,1,2,0,2,0],
      [0,0,0,0,1,0,0,0,0,0],
      [0,0,0,0,3,0,1,0,0,0],
      [0,0,0,0,3,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0]
    ]
    `
    
    const testCase2Before = `
    [
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,1,1,0,0,2,0,0,0],
      [0,0,3,3,2,0,0,0,2,0],
      [0,1,0,0,0,0,0,0,2,0],
      [0,0,3,0,0,1,2,0,0,0],
      [0,0,1,3,3,3,0,0,0,0],
      [0,0,0,1,0,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0]
    ]
    `
    
    const testCase2After = `
    [
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,2,2,0,1,0,1,0,0],
      [0,0,0,0,3,1,0,0,3,1],
      [0,2,0,0,0,1,0,0,3,1],
      [0,0,0,0,0,2,3,1,0,0],
      [0,0,2,0,0,0,0,0,0,0],
      [0,0,0,2,0,2,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0]
    ]
    `
    
    const testCase3Before = `
    [
      [0,0,0,0,1,3,1,0,0,0],
      [0,0,0,0,0,3,0,0,0,0],
      [0,0,2,0,0,0,0,3,1,0],
      [0,0,2,0,2,3,0,0,3,0],
      [0,0,2,0,0,0,0,3,0,0],
      [0,0,0,0,0,2,1,3,1,0],
      [0,0,0,0,2,2,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0]
    ]
    `
    
    const testCase3After = `
    [
      [0,0,0,0,2,0,2,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,1,3,0,0,0,0,0,2,0],
      [0,0,3,0,3,0,0,0,0,0],
      [0,1,3,0,1,1,0,0,0,0],
      [0,0,0,1,0,0,2,0,2,0],
      [0,0,0,0,3,0,1,0,0,0],
      [0,0,0,0,1,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0]
    ]
    `

    const test1 = createGridFromString(testCase1Before);
    const test1After = createGridFromString(testCase1After);
    const test1AfterAltered = createGridFromString(testCase1AfterAltered);
    const test2 = createGridFromString(testCase2Before);
    const test2After = createGridFromString(testCase2After);
    const test3 = createGridFromString(testCase3Before);
    const test3After = createGridFromString(testCase3After);

    function affirm(x, label) {
        if (x) {
            console.log("PASS " + label)
        } else {
            console.log("FAIL " + label)
        }
    }


    affirm(!areGridsEqual(test1, test1After), "test1 initial")
    
    runEvolution(test1);
    
    affirm(areGridsEqual(test1, test1After), "test1 evolution")
    affirm(!areGridsEqual(test1, test1AfterAltered), "test1 sanity check")


    affirm(!areGridsEqual(test2, test2After), "test2 initial")

    runEvolution(test2);

    affirm(areGridsEqual(test2, test2After), "test2 evolution")

    affirm(!areGridsEqual(test3, test3After), "test3 initial")

    runEvolution(test3);

    affirm(areGridsEqual(test3, test3After), "test3 evolution")

}

// printEvolutions provides an easy way to set a grid if not given a formatted string
// printEvolutions(5, 5,
//     [
//         [2,0,1], [2,1,1], [3,1,1], [1,2,2], [2,2,2], [3,2,1], [3,3,1]
//     ]
// , 2)

runTests()
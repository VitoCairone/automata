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
            rowStr += "[" + getGridCellAt(grid, i, j) + "]"
        }
        console.log(rowStr);
    };
}

showGrid(createGrid(4, 5, null))
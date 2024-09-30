

class IOUtils{
    
    // Assumes the matrix is either square or augmented
    static printMatrix(m, useLabels = false){
        // Skip if the matrix has fewer than one row
        if(m.length < 1){
            console.log("Cannot print matrix with < 1 row")
            return
        }

        const colWidth = 6;
        const numWidth = colWidth - 2;

        if(useLabels){
            let rowString = "    ";
            for(let i = 0; i < m.length; i++){
                let labelString = "  d" + floor(i / 2);
                if(i % 2){
                    labelString += "y     ";
                }
                else{
                    labelString += "x     ";
                }
                rowString += labelString.substring(0, colWidth + 1);
            }
            console.log(rowString);
        }

        // Print
        for(let i = 0; i < m.length; i++){
            this.printRowVector(m[i], i % 2, numWidth, "d" + floor(i / 2) + ((i % 2) ? "y" : "x"));
        }
        console.log(" ");
    }


    // Print an array as a row
    static printRowVector(v, appendSpace = false, numWidth = 5, label = ""){
        let rowString = label + " ["
        for(let i = 0; i < v.length; i++){
            let numString = v[i].toFixed(numWidth);
            rowString += numString.slice(0, numWidth + 1);
            if(i < v.length - 1){
                rowString += ", ";
            }
        }
        rowString += "]";
        if(appendSpace){
            rowString += " ";
        }
        console.log(rowString);
    }


    // Print an array as a column vector, i.e., vertically on multiple rows
    static printColumnVector(v){
        for(let i = 0; i < v.length; i++){
            if(i % 2){
                console.log("[" + v[i] + "]");
            }
            else{
                console.log("[" + v[i] + "] "); // Add extra space after every other line to prevent duplicates that group in browser console
            }
        }
    }

}
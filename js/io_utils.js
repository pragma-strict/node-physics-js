

class IOUtils{
    
    static printMatrix(m){
        // Skip if the matrix has fewer than one row
        if(m.length < 1){
            console.log("Cannot print matrix with < 1 row")
            return
        }

        // Print
        for(let i = 0; i < m.length; i++){
            this.printRowVector(m[i], i % 2);
        }
    }


    // Print an array as a row
    static printRowVector(v, appendSpace = false){
        let rowString = "["
        for(let i = 0; i < v.length; i++){
            let numWidth = 5;
            let numString = v[i].toFixed(3);
            rowString += numString.slice(0, numWidth);
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
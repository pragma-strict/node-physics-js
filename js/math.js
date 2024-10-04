/*
	Contains static methods for geometric calculations, mostly related to angles for now
*/
class Geometry{
	   
	// Return the angle between a and b around the origin in the range (0, TWO_PI)
	static getAngleBetween(origin, a, b){
		let toA = p5.Vector.sub(a, origin);
		let toB = p5.Vector.sub(b, origin);
		return toA.angleBetween(toB);
	}


	// Return the angle angle between the horizontal, this node, and the given position vector
	// Angle will be negative if in bottom quadrants and positive if in top quadrants (I think)
	static getReferenceAngle(origin, point){
		if(origin instanceof p5.Vector && point instanceof p5.Vector){
			return Geometry.getAngleBetween(origin, createVector(origin.x + 1, origin.y), point);
		}
		console.log("<!> One or more params to Geometry.getReferenceAngle are of incorrect type");
		return null;
	}


    // Return the angle of a1 relative to a2 i.e. a2 minus a1 such that the absolute result is never more than PI
    static getAngleDifference(a1, a2){
        let diff = (a2 - a1) % TWO_PI;
		if(diff > PI){
			diff = -PI + (diff % PI);
		}
		else if(diff < -PI){
			diff = PI + (diff % PI);
		}
        return diff % PI;
    }


	// Transform final angle so that it's representation is never more than PI different from initial angle
	static updateAngle(initial, final){
		let angleDelta = this.getAngleDifference(initial, final);
		return initial + angleDelta;
	}


	// Convert an angle in range (0, TWO_PI) to the range (-PI, PI)
	static clampAngleToPI(angle){
		if(angle > PI){
			return angle - TWO_PI;
		}
		return angle;
	}


	// Return a vector pointing 90 degrees to the right of the vector a->b
	static getPerpendicularVector(a, b){
		let c = p5.Vector.sub(a, b);
		let tempX = c.x;
		c.x = c.y;
		c.y = -tempX;
		return c;
	}


	// Return the slope between two points
	static findSlope(a, b){
		if(a.x == b.x){
		return 9999999.00;
		}
		return (a.y - b.y) / (a.x - b.x);
	}


	// Return the y-intercept of a line
	static findIntercept(point, slope){
		return point.y - point.x * slope;
	}


	static drawVector(v, origin, color){
		stroke(color);
		strokeWeight(1);
		line(origin.x, origin.y, origin.x + v.x, origin.y + v.y);
	}
}





// BUG: the first if statement should always be true. this works because sin/cos seem to evaluate to >1 sometimes. This makes no sense.
// BUG: this function is NOT guaranteed to work 100% of the time!!!
// given a point (x, y) and an angle and an arm length, find the point at the end of that arm
function getPointAtEndOfArm(x, y, angle, armLength)
{
	if(x == null || y == null || angle == null || armLength == null)
	{
		console.log("<!> getPointAtEndOfArm - NULL PARAMETER!!!");
	}


	//	Bring angle into acceptable range (0 - 2PI)
	while(angle < 0)
	{
		angle += TWO_PI;
	}

	while(angle >= TWO_PI)
	{
		angle -= TWO_PI;
	}


	var newPoint = [x, y];	// initialize new point

	//console.log("getPointAtEndOfArm: " + angle + ", cos: " + cos(angle));
	if(angle >= 0)
	{
		newPoint[0] = x + armLength * cos(angle);
		newPoint[1] = y - armLength * sin(angle);
	}
	else if(angle >= PI /2 && angle < PI)
	{
		newPoint[0] = x - armLength * cos(angle);
		newPoint[1] = y - armLength * sin(angle);
	}
	else if(angle >= PI && angle < 2*PI/3)
	{
		newPoint[0] = x - armLength * cos(angle);
		newPoint[1] = y + armLength * sin(angle);
	}
	else if(angle >= 2*PI/3 && angle < 2*PI)
	{
		newPoint[0] = x + armLength * cos(angle);
		newPoint[1] = y + armLength * sin(angle);
	}
	else
	{
		console.log("<!> getPointAtEndOfArm parameter out of acceptable range!!! (0 - 2PI)");
	}

	return newPoint;
}


// Calculate distance between 2 points on the 2D plane
function calculateDistance2D(p1, p2)
{
	var dx = p2.x - p1.x;
	var dy = p2.y - p1.y;
	return sqrt(pow(dx, 2) + pow(dy, 2));
}


// Calculate angle at p1 between p2 and the positive x-axis 
// Return angle in range 0 - 2PI
function calculateAbsoluteAngle(p1, p2)
{
	var dx = p2[X] - p1[X];
	var dy = p2[Y] - p1[Y];
	var angle = 0;

	if(dy < 0)
	{
		if(dx >= 0)	// Quadrant 1
		{
			angle = abs(atan(dy / dx));
		}
		else	// Quadrant 2
		{
			angle = abs(atan(dx / dy)) + HALF_PI; 
		}
	}
	else
	{
		if(dx < 0)	// Quadrant 3
		{
			angle = abs(atan(dy / dx)) + PI;
		}
		else	// Quadrant 4
		{
			angle = abs(atan(dx / dy)) + PI + HALF_PI;
		}
	}

	return angle;
}



class LinearAlgebra{
	
    // Performs forward eliminaiton on an augmented matrix to convert it into REF. Return false if failed.
    static forwardEliminate(m){
        const n = m.length; // The number of rows
        
        // Loop through the pivot indices
        for(let pivot = 0; pivot < n - 1; pivot++){ // Go to second-last row because you're zeroing the one below this
            
            // If the pivot is zero, swap rows in the matrix until there's a non-zero element on each pivot
            // Commented out for now because swapping changes the mapping from row indices to equations (and thus the
            // interpretation of the rows when we apply them to actual displacements)
            // if(m[pivot][pivot] == 0){
            //     console.log("Found zero-pivot: " + pivot + ", attempting to swap with row below...");
                
            //     let swapIndex = pivot;
            //     for(let j = pivot; j < n; j++){
            //         if(m[j][pivot] != 0){
            //             swapIndex = j;
            //             continue;
            //         }
            //     }
            //     if(swapIndex == pivot){
            //         console.log("<!> Unable to resolve zero-pivot by swapping. Exiting early to avoid div by zero.");
            //         return false;
            //     }
            //     else{
            //         console.log("Swapping rows " + pivot + " and " + swapIndex);
            //         this.swapRows(m, pivot, swapIndex);
            //     }
            // }

            if(m[pivot][pivot] == 0){
                console.log("<!> Zero-element in pivot column. Unable to complete forward substitution.")
                return false;
            }

            // For each column, loop through the rows below the pivot index
            for(let row = pivot + 1; row < n; row++){
                // Get the factor which, when multiplied by the current pivot, would make it equal to m[row][pivot]
                const factor = m[row][pivot] / m[pivot][pivot];

                // m[row][pivot] is an element in the column below the current pivot that we're trying to zero out

                // Multiply the entire pivot row by the factor and subtract it from the current row to zero out m[row][pivot]
                // Go all the way to the last column here so our updates get applied to the augmented part too
                let foundNonZero = false;
                for(let col = 0; col <= n; col++){
                    m[row][col] -= factor * m[pivot][col];
                    if(abs(m[row][col]) > 0.00001){
                        foundNonZero = true;
                    }
                }
                if(!foundNonZero){
                    console.log("<!> A row of all zeroes was created, indicating that this system as infinite solutions. Returning.");
                    return false;
                }
            }
        }
        return true;
    }


    // Solves for the unknown vector d based on an REF augmented matrix m. Return false if failed.
    static backSubstitute(m, d){
        const n = m.length; // The number of rows

        // Loop through each row, starting from the last (since we need to solve the last ones first)
        for(let row = n - 1; row >= 0; row--){
            d[row] = m[row][n]; // Get the augmented element in this row

            // Subtract all of the solved variables in the row multiplied by their coefficients in m
            for(let solvedRow = row + 1; solvedRow < n; solvedRow++){
                d[row] -= d[solvedRow] * m[row][solvedRow];
            }

            // Handle the case where the coefficient of the unknown is zero (we can't solve the unknown then)
            if(m[row][row] == 0){
                if(m[row][n] != 0){
                    console.log("Found row with diagonal element as zero but the augmented element is non-zero. This indicates an inconsistent system with zero solutions.");
                    return false;
                }
                else{
                    // If both the unknown's coefficient and the augmented element are zero, just set the unknown to zero
                    d[row] = 0;
                }
            }
            else{
                // Divide by the coefficient of the unknown in the current row to get the final value
                d[row] /= m[row][row];
            }
        }
        return true;
    }


    // Swap rows i and j
    static swapRows(m, i, j){
        // Validate i
        if(i < 0 || i >= m.length){
            console.log("Input row i (" + i + ") is out of bounds for matrix with " + m.length + " rows.");
            return m;
        }

        // Validate j
        if(j < 0 || j >= m.length){
            console.log("Input row j (" + j + ") is out of bounds for matrix with " + m.length + " rows.");
            return m;
        }

        // Create new matrix
        let _m = [];
        for(let currentRow = 0; currentRow < m.length; currentRow++){
            if(currentRow == i){
                _m.push(m[j]);
            }
            else if(currentRow == j){
                _m.push(m[i]);
            }
            else{
                _m.push(m[currentRow]);
            }
        }

        return _m;
    }


    // Multiply row i by non-zero number x
    static multiplyRow(m, i, x){
        // Validate i
        if(i < 0 || i >= m.length){
            console.log("Input row i (" + i + ") is out of bounds for matrix with " + m.length + " rows.");
            return m;
        }

        // Validate x
        if(x == 0){
            console.log("The scalar value cannot be zero when multiplying matrix rows.");
            return m;
        }

        // Create new matrix
        let _m = [];
        for(let currentRow = 0; currentRow < m.length; currentRow++){
            if(currentRow == i){
                let newRow = [];
                for(let currentCol = 0; currentCol < m[0].length; currentCol++){
                    newRow.push(m[i][currentCol] * x);
                }
                _m.push(newRow);
            }
            else{
                _m.push(m[currentRow]);
            }
        }

        return _m;
    }


    // Add the row i, scaled by x, to the row j
    static addScaledRow(m, i, x, j){
        // Validate i
        if(i < 0 || i >= m.length){
            console.log("Input row i (" + i + ") is out of bounds for matrix with " + m.length + " rows.");
            return m;
        }

        // Validate j
        if(j < 0 || j >= m.length){
            console.log("Input row j (" + j + ") is out of bounds for matrix with " + m.length + " rows.");
            return m;
        }

        // Validate x
        if(x == 0){
            console.log("The scalar value cannot be zero when multiplying matrix rows.");
            return m;
        }

        let scaledRow = [];
        for(let currentCol = 0; currentCol < m[0].length; currentCol++){
            scaledRow.push(m[i][currentCol] * x);
        }

        let summedRow = [];
        for(let currentCol = 0; currentCol < m[0].length; currentCol++){
            summedRow.push(m[j][currentCol] + scaledRow[currentCol]);
        }

        // Create new matrix
        let _m = [];
        for(let currentRow = 0; currentRow < m.length; currentRow++){
            if(currentRow == j){
                _m.push(summedRow);
            }
            else{
                _m.push(m[currentRow]);
            }
        }

        return _m;
    }


    static augmentMatrix(f, k){
        let aug = [];
        for(let i = 0; i < k.length; i++){
            let row = [];
            for(let j = 0; j < k[0].length; j++){
                row.push(k[i][j]);
            }
            row.push(f[i]);
            aug.push(row);
        }
        return aug;
    }

}
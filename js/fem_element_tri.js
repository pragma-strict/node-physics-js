
/* 

*/
class FEMElementTri{
    constructor(n1, n2, n3){
        // Nodes that define the elmenet
        this.n1 = n1;
        this.n2 = n2;
        this.n3 = n3;

        this.k = []; // Local stiffness matrix
        this.B = []; // Local strain-displacement matrix
        this.D = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 0.5]]; // Constitutive matrix (material properties), simplified constant for now
        this.area = 0; // Element area

        // Make sure the nodes are ordered counter-clockwise (I think)
        if(this.getCrossProduct().z < 0){
            console.log("New element nodes in reverse order. Swapping.")
            let temp = this.n2;
            this.n2 = this.n1;
            this.n1 = temp;
        }
    }


    render(gridOrigin, color){
        noStroke();
        fill(color);
        triangle(
            gridOrigin.x + this.n1.position.x,
            gridOrigin.y + this.n1.position.y,
            gridOrigin.x + this.n2.position.x,
            gridOrigin.y + this.n2.position.y,
            gridOrigin.x + this.n3.position.x,
            gridOrigin.y + this.n3.position.y
        );
    }


    // Every frame
    tick(deltaTime){
        console.log("Cross: " + this.getCrossProduct());
        console.log("Cross.z: " + this.getCrossProduct().z);
        this.area = abs(this.getCrossProduct().z) / 2; // Recalculate the area first, for now
        console.log("Area: " + this.area);
        
        this.calculateStrainDisplacementMatrix();
        console.log("B: ");
        IOUtils.printMatrix(this.B);

        this.calculateStiffnessMatrix();
        console.log("k: ");
        IOUtils.printMatrix(this.k);
    }


    // Calculate k
    calculateStiffnessMatrix(){
        let DB = this.multiplyMatrices(this.D, this.B);
        let BT = this.transposeMatrix(this.B);
        let BTDB = this.multiplyMatrices(BT, DB);
        this.scaleMatrix(BTDB, this.area)
        this.k = BTDB;
    }


    // Calculate B
    calculateStrainDisplacementMatrix(){
        // Start by calculating all these
        let b1 = this.n2.position.y - this.n3.position.y;
        let b2 = this.n3.position.y - this.n1.position.y;
        let b3 = this.n1.position.y - this.n2.position.y;
        let c1 = this.n3.position.x - this.n2.position.x;
        let c2 = this.n1.position.x - this.n3.position.x;
        let c3 = this.n2.position.x - this.n1.position.x;

        // Then drop them all into the matrix in the correct places
        this.B = [
            [b1, 0, b2, 0, b3, 0],
            [0, c1, 0, c2, 0, c3],
            [c1, b1, c2, b2, c3, b3]
        ];

        // Finally, scale by 1/(2*area)
        this.scaleMatrix(this.B, 1 / (2 * this.area));
    }



    //=== Copy-pasted linear algebra ===//
    
    // Get the cross product between vectors from n1 to n2 and n3, respectively
    getCrossProduct(){
        let v1 = p5.Vector.sub(this.n2.position, this.n1.position);
        let v2 = p5.Vector.sub(this.n3.position, this.n1.position);
        return p5.Vector.cross(v1, v2);
    }


    // Element-wise multiplication of matrix M by a scalar x
    scaleMatrix(M, x){
        for(let i = 0; i < M.length; i++){
            for(let j = 0; j < M[0].length; j++){
                M[i][j] *= x;
            }
        }
    }


    // Multiply matrix A with matrix B
    multiplyMatrices(A, B) {
        const rowsA = A.length;
        const colsA = A[0].length;
        const rowsB = B.length;
        const colsB = B[0].length;
    
        // Ensure matrices can be multiplied
        if (colsA !== rowsB) {
            throw new Error("Number of columns in A must be equal to number of rows in B");
        }
    
        // Initialize result matrix C (rowsA x colsB) with zeros
        const C = new Array(rowsA).fill(0).map(() => new Array(colsB).fill(0));
    
        // Perform matrix multiplication
        for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsB; j++) {
                for (let k = 0; k < colsA; k++) {
                    C[i][j] += A[i][k] * B[k][j];
                }
            }
        }
    
        return C;
    }


    transposeMatrix(A) {
        const rows = A.length;
        const cols = A[0].length;
    
        // Initialize an empty matrix T (cols x rows)
        const T = new Array(cols).fill(0).map(() => new Array(rows).fill(0));
    
        // Fill T with the transpose of A
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                T[j][i] = A[i][j];
            }
        }
    
        return T;
    }

}
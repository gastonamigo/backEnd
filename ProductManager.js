const fs = require('fs');

class ProductManager {
    #accId = 0;
    #path = "";

    constructor(path) {
        this.#path = path;
    }

    //OBTENGO LA LISTA DE PRODUCTOS
    async getProducts() {
        try {
            const prod = await fs.promises.readFile(this.#path, "utf-8");
            return JSON.parse(prod);

        } catch (e) {
            return [];

        }

    }
    //FILTRA Y OBTIENE EL PRODUCTO POR ID
    async getProductById(prodId) {
        const product = await this.getProducts();
        let prod = product.find((p) => p.id === prodId);
        if (prod) {
            return prod;
        } else {
            throw new Error(`Product ID: ${prodId} Not Found`);
        }
    }
    // AGREGA EL PRODUCTO 
    async addProduct(title, description, price, thumbnail, code, stock) {

        const newProduct = {
            id: this.#accId,
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
        };
        //CHECKEANDO SI FALTA INFORMACION
        if (!title || !description || !price || !thumbnail || !code || !stock) {
            throw new Error("missing information");
        }

        // CHECKEANDO QUE NO SE REPITA EL CODE    
        const product = await this.getProducts();
        const checkCode = product.some((p) => p.code === code);

        if (checkCode) {
            throw new Error("product code already exist");
        } else {
            fs.promises.writeFile(this.#path, JSON.stringify([...product, newProduct]));
            this.#accId++;
        }

    }
    //ACTUALIZA EL PRODUCTO
    async updateProduct(id, update) {
        const product = await this.getProducts();
        let productUpdated = product.find(prod => prod.id === id);

        if (!productUpdated) {
            throw new Error("Product ID not found");//CHECKEA QUE EXISTA EL ID
        }

        if (Object.keys(update).includes('code')) {
            let checkCode = product.some(i => i.code === update.code)
            if (checkCode) {
                throw new Error("Product code modification not allowed")//CHECKEA SI SE ENVIA UN CODIGO PARA MODIFICAR
            }
        }

        productUpdated = { ...productUpdated, ...update };
        let newArray = product.filter(prod => prod.id !== id);

        newArray = [...newArray, productUpdated];

        await fs.promises.writeFile(this.#path, JSON.stringify(newArray));

        console.log('Updated Product');
    }

    //BORRA EL PRODUCTO POR ID   
    async deleteProduct(prodId) {
        const product = await this.getProducts();
        let productId = product.find((p) => p.id === prodId);
        if (!productId) {
            throw new Error(` product id: ${prodId} not found`);

        } else {
            let eraser = product.filter((p) => p.id !== prodId);
            fs.promises.writeFile(this.#path, JSON.stringify(eraser));

        }
    }

}




async function main() {



    const manager = new ProductManager('./products.json');

    // console.log(await manager.getProducts()); // []
    //   await manager.addProduct("producto prueba", "Este es un producto prueba", 200, "sin imagen", "abc123456", 25);
    //   await manager.addProduct("producto prueba", "Este es un producto prueba", 200, "sin imagen", "abc12345", 25);
    //   await manager.addProduct("producto prueba", "Este es un producto prueba", 200, "sin imagen", "abc1234", 25);
    //   await manager.deleteProduct(1);
    //   console.log(await manager.getProducts()); // []
    //   console.log(await manager.getProductById(0));
    //   console.log(await manager.getProductById(5));
}
main();
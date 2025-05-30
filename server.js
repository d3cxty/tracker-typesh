import express from 'express';
import dotenv from 'dotenv';
import customerRoute from './routes/customer.route.js';
import productRoute from './routes/product.route.js';
import orderRoute from './routes/order.route.js';
import inventoryRoute from './routes/inventory.route.js';
import { connectDB } from './config/db.js';



const app = express();

dotenv.config();
app.use(express.json())
app.use('/api/product', productRoute);
app.use('/api/customer', customerRoute);
app.use('/api/inventory',inventoryRoute);
app.use('/api/order', orderRoute);

app.get('/api',(req,res)=>{
console.log("welcome to XM Bakery Api")
res.send("welcome to XM Bakery Api")
})

try{
const port = process.env.PORT
app.listen(port,()=>{
    connectDB();
    console.log(`app running on port http://localhost:${port}/api`)
})
}catch(err){
    console.error(err)

}

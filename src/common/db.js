
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || process.env.URI_MONGO;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// función que asegura la conexión antes de exportar
async function connectDB() {
  if (!client.topology?.isConnected()) {
    await client.connect();
    console.log("Conectado a MongoDB Atlas");
  }
  return client;
}

// exportamos el cliente ya conectado
export default await connectDB();

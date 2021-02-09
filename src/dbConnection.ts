import mongoose from 'mongoose';
import 'dotenv/config';

const connectToTheDatabase = () => {
    mongoose.connect(process.env.DB_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
}

export default connectToTheDatabase;
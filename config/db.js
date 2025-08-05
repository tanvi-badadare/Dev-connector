import mongoose from 'mongoose';

const db = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            //useCreateIndex: true
        });

        console.log('MongoDB connected...');

    } catch (err) {
        console.error(err.message);
        //Exit process with failure
        process.exit(1);
    }
};

export default connectDB;


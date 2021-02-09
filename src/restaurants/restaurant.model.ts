import * as mongoose from 'mongoose';

import IRestaurant from './restaurant.interface';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: Boolean, default: true },
  description: { type: String, required: false },
  restroCode: { type: Number, required: true },
},
{
    strict: false,
    versionKey: false,
    timestamps: true,
});

const restaurantModel = mongoose.model<IRestaurant & mongoose.Document>('Restaurant', restaurantSchema);
 
export default restaurantModel;
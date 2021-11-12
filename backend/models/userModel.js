import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique:true, trim:true, lowercase:true},
    password: {type: String, required: true},
    activateCode: {type: String, required: true},
    activate: {type: Boolean, required: true, default:false},
    balance:{type: Number, default: 0},
    subscriptionStatus: {type: String, },
    subscriptionId: {type:String},
    token:{ data: String, dafault: ''},
},{
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
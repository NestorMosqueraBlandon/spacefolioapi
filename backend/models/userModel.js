import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique:true, trim:true, lowercase:true},
    password: {type: String, required: true},
    activateCode: {type: String, required: true},
    activate: {type: Boolean, required: true, default:false},
    token:{ data: String, dafault: ''}
},{
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
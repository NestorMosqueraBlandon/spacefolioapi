import bcrypt from 'bcrypt';

const data = {
  users:[
    {
      email: 'yunsde18@example.com',
      password: bcrypt.hashSync('1234', 8)
    },
    {
      email: 'useradmin@example.com',
      password: bcrypt.hashSync('1234', 8)
    }

  ],
};


export default data;
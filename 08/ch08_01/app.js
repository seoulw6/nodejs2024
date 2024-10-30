const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite', //Sqlite3 use
    storage: 'post.db' // data file name
});
// `create table user(username varchar(255) not null, email varchar(255) not null);`
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
});

(async () => {
    // async function await 즉시 실행
    // await sequelize.sync({ force: true }); //강제로 테이블 생제
    // const user1 = await User.create({
    //     username: 'user01',
    //     email: 'user01@gmail.com'
    // });

    // console.log(`user created: ${JSON.stringify(user1)}`);

    // const users = await User.bulkCreate([
    //     { username: 'user02', email: 'user02@gmail.com' },
    //     { username: 'user03', email: 'user03@gmail.com' },
    //     { username: 'user04', email: 'user04@gmail.com' }
    // ]);
    // console.log(`users created: ${JSON.stringify(users)}`);

    // const allUsers = await User.findAll(); // select * from users
    // allUsers.forEach(user => {
    //     console.log(`username: ${user.username}, email: ${user.email}`);
    // });


    await User.update({ email: 'user02@naver.com' }, {  //update users set email = '
        where: { username: 'user02' }
    });
    const user02 = await User.findOne({ where: { username: 'user02' } });
    console.log(`user02 updated : ${JSON.stringify(user02)}`);
})();

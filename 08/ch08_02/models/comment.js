//

module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false, // 필수
            primaryKey: true,
            autoIncrement: true,
        },
        content: {
            type: DataTypes.STRING(100),
        }
    });

    Comment.associate = (db) => {
        db.Comment.belongsTo(db.Post);
    };

    return Comment;
}
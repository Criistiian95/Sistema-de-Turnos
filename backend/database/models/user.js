module.exports = (sequelize, dataTypes) => {
  let alias = 'User'
  let cols = {
      id: {
          type: dataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true
      },
      name: {
          type: dataTypes.TEXT(20),
          allowNull: false
      },
      lastname: {
          type: dataTypes.TEXT(100),
          allowNull: false
      },
      email: {
        type: dataTypes.TEXT(100),
        unique: true,
        allowNull: false,
      },
      password: {
          type: dataTypes.TEXT,
          allowNull:null
      },
      role_id: {
          type: dataTypes.INTEGER
      }
  }
  let config = {
      tableName: "User",
      timestamps: false,  
  }
  const User = sequelize.define(alias, cols, config);
  
 User.associate = (models)=>{
      User.belongsTo(models.Role, {
          as : 'role',
          foreignKey : 'role_id'
      })
  }
  return User;
};
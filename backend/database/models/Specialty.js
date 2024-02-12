module.exports = (sequelize, dataTypes) => {
    let alias = 'Specialty'
    let cols = {
        id: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: dataTypes.TEXT(20),
        }
    }
    let config = {
        timestamps: false
    }
    const Specialty = sequelize.define(alias, cols, config);
    
    return Specialty;
  };
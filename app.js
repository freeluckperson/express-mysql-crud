import dotenv from "dotenv";
dotenv.config();
const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } = process.env;
import express from "express";
import morgan from "morgan";
import { Sequelize, DataTypes } from "sequelize";

// Configura la conexión a la base de datos MySQL
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
});

// Define el modelo de la tabla
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// Crea la tabla en la base de datos si no existe
sequelize.sync();

// Middleware para manejar errores
const errorHandler = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

//Middleware
const app = express();
app.use(morgan("dev"));
app.use(express.json());

// Rutas para el CRUD
app.get(
  "/users",
  errorHandler(async (req, res) => {
    const users = await User.findAll();
    res.json(users);
  })
);

app.get(
  "/users/:id",
  errorHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  })
);

app.post(
  "/users",
  errorHandler(async (req, res) => {
    const { name, email, age } = req.body;
    const user = await User.create({ name, email, age });
    res.json(user);
  })
);

app.put(
  "/users/:id",
  errorHandler(async (req, res) => {
    const { name, email, age } = req.body;
    await User.update({ name, email, age }, { where: { id: req.params.id } });
    res.json({ message: "Usuario actualizado correctamente" });
  })
);

app.delete(
  "/users/:id",
  errorHandler(async (req, res) => {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: "Usuario eliminado correctamente" });
  })
);

// Manejador de evento para la conexión exitosa

// Inicia el servidor
app.listen(3000, () => {
  sequelize
    .authenticate()
    .then(() => {
      console.log("<<<<Conexión exitosa con la base de datos");
    })
    .catch((error) => {
      console.error("Error al conectar con la base de datos:", error);
    });
  console.log("<<<<Servidor iniciado en el puerto 3000");
});

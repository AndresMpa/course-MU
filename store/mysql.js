const mysql = require("mysql");
const config = require("../config");

const dbConf = {
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
};

let connection;

function handleDbConnection() {
  connection = mysql.createConnection(dbConf);

  connection.connect((error) => {
    if (error) {
      console.error(`[DATA BASE ERROR] ${error}`);
      setTimeout(handleDbConnection, 2000);
    } else {
      console.log("[DATA BASE]: Connection created succesfully");
    }
  });

  connection.on("error", (error) => {
    console.error(`[DATA BASE ERROR] ${error}`);
    if (error.code === "PROTOCOL_CONNECTION_LOST") {
      handleDbConnection();
    } else {
      throw error;
    }
  });
}

handleDbConnection();

function list(table) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM ${table}`, (error, result) => {
      return error ? reject(error) : resolve(result);
    });
  });
}

function get(table, id) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM ${table} WHERE id = '${id}'`,
      (error, result) => {
        return error ? reject(error) : resolve(result);
      }
    );
  });
}

function insert(table, data) {
  return new Promise((resolve, reject) => {
    connection.query(`INSERT INTO ${table} SET ?`, data, (error, result) => {
      return error ? reject(error) : resolve(result);
    });
  });
}

function update(table, data) {
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE ${table} SET ? WHERE id = ?`,
      [data, data.id],
      (error, result) => {
        return error ? reject(error) : resolve(result);
      }
    );
  });
}

function remove(table, id) {
  return new Promise((resolve, reject) => {
    connection.query(`DELETE FROM ${table} WHERE id = ?`, id, (error, result) => {
      return error ? reject(error) : resolve(result);
    });
  });
}

function searchQuery(table, query) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM ${table} WHERE ?`,
      query,
      (error, result) => {
        return error ? reject(error) : resolve({ ...result[0] } || null);
      }
    );
  });
}

function upsert(table, data) {
  if (data && data.id) {
    return update(table, data);
  } else {
    return insert(table, data);
  }
}

module.exports = {
  get,
  list,
  upsert,
  remove,
  searchQuery,
};

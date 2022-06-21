'use strict';
/* Data Access Object (DAO) module for accessing courses and exams */

const sqlite = require('sqlite3');

//Si apre il database
const db = new sqlite.Database('exams.sqlite', (err) => {
  if(err) throw err;
});

// Si prende la lista di tutti i corsi
exports.listCourses = () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT esami.codice, esami.nome, esami.cfu, esami.max_studenti, esami.incompatibile, esami.propedeutico, count(caricoDidattico.codice) as studenti_iscritti FROM esami LEFT JOIN caricoDidattico ON esami.codice = caricoDidattico.codice GROUP BY esami.codice';
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const courses = rows.map((e) => ({ codice: e.codice, nome: e.nome, cfu: e.cfu, max_studenti: e.max_studenti, incompatibile: e.incompatibile, propedeutico: e.propedeutico, studenti_iscritti: e.studenti_iscritti }));
        resolve(courses);
      });
    });
  };


//Carico didattico che verrà visualizzato
exports.getCaricoDidatticoToDisplay = (userId) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT  esami.codice, esami.nome, esami.cfu, esami.max_studenti, esami.incompatibile, esami.propedeutico FROM esami JOIN caricoDidattico ON esami.codice = caricoDidattico.codice WHERE caricoDidattico.id = ?';
      db.all(sql, [userId], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const courses = rows.map((e) => ({ codice: e.codice, nome: e.nome, cfu: e.cfu, max_studenti: e.max_studenti, incompatibile: e.incompatibile, propedeutico: e.propedeutico }));
        resolve(courses);
      });
    });
  };

// Si prende la lista di tutti i corsi
exports.getCaricoDidattico = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM caricoDidattico WHERE id = ?';
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const courses = rows.map((e) => ({ id: e.id, codice: e.codice}));
      resolve(courses);
    });
  });
};

// add a new exam
exports.addExamsToCarico = (newExam) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO caricoDidattico VALUES(?, ?)';
    db.run(sql, [newExam.codice, newExam.id], function (err) {  // <-- NB: function, NOT arrow function so this.lastID works
  
      if (err) {
        reject(err);
        return;
      }
      console.log('createExam lastID: ' + this.lastID );
      resolve(this.lastID);
    });
  });
};

// delete an existing exam
exports.deleteExam = (course_code, userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM caricoDidattico WHERE codice = ? AND id = ?';
    db.run(sql, [course_code, userId], (err) => {
      if (err) {
        reject(err);
        return;
      } else
        resolve(null);
    });
  });
}


// update the fullTime bool of a user
exports.updateFulltime = (fullTime, userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE user SET fullTime= ? WHERE id = ?';
    db.run(sql, [fullTime, userId], function (err) {  // <-- NB: function, NOT arrow function so this.lastID works
      if (err) {
        reject(err);
        return;
      }

      resolve(this.lastID);
    });
  });
};

// delete the study plan of a user
exports.deleteCaricoDidattico = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM caricoDidattico WHERE id = ?';
    db.run(sql, [userId], function (err) {  // <-- NB: function, NOT arrow function so this.lastID works
      if (err) {
        reject(err);
        return;
      }
      if(this.changes == 0){
        reject(err);
        return;
      }
      
      resolve(this.lastID);
    });
  });
};
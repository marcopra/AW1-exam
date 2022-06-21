/*
 * All the API calls
 */

const APIURL = new URL('http://localhost:3001/api/');  

async function getAllCourses() {
  // call: GET /api/esami
  const response = await fetch(new URL('esami', APIURL));
  const coursesJson = await response.json();
  if (response.ok) {
    return coursesJson.map((e) => ({ codice: e.codice, nome: e.nome, cfu: e.cfu, max_studenti: e.max_studenti, incompatibile: e.incompatibile, propedeutico: e.propedeutico, studenti_iscritti: e.studenti_iscritti }));
  } else {
    throw coursesJson;  // an object with the error coming from the server
  }
}

async function getCaricoDidatticoToDisplay() {
    // call: GET /api/caricoDidattico
    const response = await fetch(new URL('caricoDidattico', APIURL) , {credentials: 'include'});
    const coursesJson = await response.json();
    if (response.ok) {
      return coursesJson.map((e) => ({ id: e.id, codice: e.codice, nome: e.nome, cfu: e.cfu, max_studenti: e.max_studenti, incompatibile: e.incompatibile, propedeutico: e.propedeutico, studenti_iscritti: e.studenti_iscritti, fullTime: e.fullTime }));
    } else {
      throw coursesJson;  // an object with the error coming from the server
    }
  }


  function addExamToCarico(fullTime, exams) {
    // call: PUT /api/carico

    return new Promise((resolve, reject) => {
      fetch(new URL('carico', APIURL), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({fullTime: fullTime, exams: exams}),
      }).then((response) => {
        if (response.ok) {
          
          resolve(null);
        } else {

        
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
  }

  function deleteAllCarico() {
    // call: DELETE /api/carico
    return new Promise((resolve, reject) => {
      fetch(new URL('carico/', APIURL), {
        method: 'DELETE',
        credentials: 'include',
        
      }).then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
  }


  async function logIn(credentials) {
    let response = await fetch(new URL('sessions', APIURL), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (response.ok) {
      const user = await response.json();
      return user;
    } else {
      const errDetail = await response.json();
      throw errDetail.message;
    }
  }
  
  async function logOut() {
    await fetch(new URL('sessions/current', APIURL), { method: 'DELETE', credentials: 'include' });
  }
  
  async function getUserInfo() {
    const response = await fetch(new URL('sessions/current', APIURL), {credentials: 'include'});
    const userInfo = await response.json();
    if (response.ok) {
      
      return userInfo;
    } else {
      throw userInfo;  // an object with the error coming from the server
    }
  }


const API = { getAllCourses, getCaricoDidatticoToDisplay, addExamToCarico, logIn, logOut, getUserInfo, deleteAllCarico};
export default API;
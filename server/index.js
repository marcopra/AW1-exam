'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const {check, validationResult, param} = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the users in the DB
const cors = require('cors');


/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });
        
      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});


// init express
const app = express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions)); // NB: Usare solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti


// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated())
    return next();
  
  return res.status(401).json({ error: 'not authenticated'});
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
  resave: false,
  saveUninitialized: false 
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

/*** APIs ***/

// GET /api/esami
app.get('/api/esami', (req, res) => {
  dao.listCourses()
    .then(courses => {res.json(courses)})
    .catch((err) => {
      console.log(err);
      res.status(500).json({error: `Database error while retrieving the list of courses`}).end()
    });
});

// GET /api/caricoDidattico  -> carico didattico to diplay!!!
app.get('/api/caricoDidattico', isLoggedIn, (req, res) => {
  dao.getCaricoDidatticoToDisplay(req.user.id) 
    .then(carico => {
      dao.listCourses().then((courses) =>{
      let merged = []
      for(let i=0; i<carico.length; i++) {
        merged.push({
         ...carico[i], 
         studenti_iscritti: (courses.find((itmInner) => itmInner.codice === carico[i].codice).studenti_iscritti)}
        );
      }
      
      res.json(merged);
    })
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({error: `Database error while retrieving the list of courses`}).end()
    });
});


// PUT /api/exams
app.put('/api/carico',isLoggedIn, [

  check('exams.*.codice').isLength(7)
],
async (req, res) => {
  const errors = validationResult(req); 
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array()  }); // error message is a single string with all error joined together
    }
  
  let allExams = await dao.listCourses();
  let caricoDidattico =  await dao.getCaricoDidatticoToDisplay(req.user.id)
  let errorMsg = '';
  let recoveryAdd = [];
  let recoveryDelete = [];
  let caricoDidatticoTemp = req.body.exams; 
  let minCfu;
  let maxCfu;
  let tempCFU = 0;
  let fullTime = req.user.fullTime

  if (!caricoDidatticoTemp){
    return res.status(422).json({errors: "Richiesta fallita"});
  }


  let newExams =  caricoDidatticoTemp.filter((ex) =>  !caricoDidattico.find((c) => c.codice === ex.codice));
  
  let examToAdd = [];
  
    //update del carico didattico
    for (let el of newExams){
    
      examToAdd.push({codice: el.codice})
    }
    
    let examToDelete =  caricoDidattico.filter((ex) => !caricoDidatticoTemp.find((c) => c.codice === ex.codice)); 

  
  try {
    /*--------------VALIDAZIONE--------------*/

    if (req.user.fullTime == -1){
      if(req.body.fullTime != 0 &&  req.body.fullTime != 1) 
      {
        return res.status(422).json({errors: "Stato Full Time/Part Time non definito"});
      }
      dao.updateFulltime(req.body.fullTime, req.user.id)
      fullTime = req.body.fullTime;
    }
  
    if (fullTime == 1 ) {
      minCfu = 60;
      maxCfu = 80;
    }
    else if (fullTime == 0 ){
      minCfu = 20;
      maxCfu = 40
    }
    for(let i = 0; i < examToAdd.length; i++) {

      tempCFU += allExams.filter((e) => e.codice == examToAdd[i].codice)[0].cfu
    }
    
    for (const cd of caricoDidattico){
      tempCFU += cd.cfu;
    }

    for (const cd of examToDelete){
      tempCFU -=cd.cfu;
    }

    if(tempCFU < minCfu){
      return res.status(422).json({errors: "Crediti Insufficienti"});
    }

    if(tempCFU > maxCfu){
      return res.status(422).json({errors: "I crediti sono superiori al limite massimo"});
    }
    
    for(let i = 0; i < examToAdd.length; i++) { 

      
      errorMsg = await controlli(examToAdd[i], req.user);
      
      //Se passa i controlli allora può essere aggiuntp
      if(errorMsg == ''){
        recoveryAdd.push(examToAdd[i].codice)
        const newExam = {
          id: req.user.id, 
          codice: examToAdd[i].codice,
        };
  
        await dao.addExamsToCarico(newExam);
      }  
    }

    for (const exam of examToDelete){

      //Se è l'esame propedetico di un altro esame non si può cancellare!
      if(caricoDidattico.find((ex) => ex.propedeutico == exam.codice)){
        let temp = caricoDidattico.filter((ex) => ex.propedeutico == exam.codice);
        errorMsg =  "l'esame scelto da eliminare è propedeutico a: " + temp[0].propedeutico;
      }
      else {
  
        dao.deleteExam(exam.codice, req.user.id).then(recoveryDelete.push(exam));
        

      }

    }
  
    //Roll back dei salvataggi
    if(!errorMsg == ''){
      for (let ex of recoveryAdd){
          dao.deleteExam(ex.codice, req.user.id).catch( res.status(503).json({error: `Fatal error`}));
        }
      for(let ex of recoveryDelete){
        const newExam = {
            id: req.user.id, 
            codice: ex.codice,
          };
        dao.addExamsToCarico(newExam).catch( res.status(503).json({error: `Fatal error`}));

      }
        return res.status(422).json({errors: errorMsg});
      }
    res.status(201).end();
  } catch(err) {
    
    res.status(503).json({error: `Database error during the creation of the study plan of user ${req.user.id}.`});
  }
});


// DELETE /api/carico/
app.delete('/api/carico/' , isLoggedIn, async (req, res) => {
  try {
  
    await dao.deleteCaricoDidattico(req.user.id)
    await dao.updateFulltime(-1, req.user.id)
    
    res.status(204).end();
  } catch(err) {
    console.log(err);
    res.status(503).json({ error: `Database error during the deletion user's study plan.`});
  }
});



/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        return res.json(req.user);
      });
  })(req, res, next);
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout( ()=> { res.end(); } );
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
 
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Unauthenticated user!'});;
});


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


/*------my function------*/
async function controlli (ex, user) 
{
  
  let allExams = await dao.listCourses();


  let alreadyChosen = false;

  let errorMsg = '';

  let caricoDidattico =  await dao.getCaricoDidatticoToDisplay(user.id)  
  let codeExam = ex.codice;

  /*Prendo i dati corrispondenti al codice dell'esame dal server perchè sono più sicuri*/
  let exam = allExams.filter((e) => e.codice == codeExam)[0] 
  

  /*CONTROLLI*/
    /*Controllo incompatibilità*/   
    if(caricoDidattico.find(c => {
                                    
        if(c.incompatibile != undefined){
          //Controllo che un film gia presente nel carico non sia incompatibile con la scelta fatta
          let incompatibileCarico = c.incompatibile.split(" ");
          for (var i = 0; i < incompatibileCarico.length; i ++ )
          {
              
              if (incompatibileCarico[i] === exam.codice)
              {
                  
                  return true;
              }
      
          }
        }

        if(exam.incompatibile != undefined){
    
        //Controllo che il film selezionato non abbia incompatibilità con film già presenti nel carico
        let incompatibileSelezione = exam.incompatibile.split(" ");  
        for (var i = 0; i < incompatibileSelezione.length; i ++ )
        {

            if (incompatibileSelezione[i] === c.codice)
            {
                
                return true;
            }
    
        }
        return false;
        
      }
    }))
    {

        errorMsg +="Incompatibilità con l'esame '" + caricoDidattico.incompatibile + "'. ";
    }

    /*Controllo propedeucità*/
    if((exam.propedeutico != '')  && (!caricoDidattico.find((c) => c.codice === exam.propedeutico)))//Si cotrolla se effettivamente c'è un esame propedeutico
    {
       
        
        errorMsg += "Scegliere prima l'esame propedeutico '" + exam.propedeutico + "'. " ;
        
    }

    /*Si controlla se sono ammesse ulteriori iscrizioni al corso */
    //il > non è nescessario poichè non si dovrebbero superare il numero massimo di studenti.
    //Tuttavia, viene comunque messo il > poichè qualora ci fosse un errore sul server non vengono comunque ammesse nuove iscrizioni  

    if((exam.max_studenti != -1) && (exam.studenti_iscritti >= exam.max_studenti )) 
    {
        errorMsg = "Per questo corso è stato raggiunto il numero massimo di iscrizioni. ";
    }

    /* Controllo esame già scelti */
    if (caricoDidattico.find((c) => exam.codice === c.codice )){
      alreadyChosen = true;
    }
    else{
        alreadyChosen = false;
    }

    if(alreadyChosen){
      errorMsg = "L'esame è già stato scelto"
    }

    
 return errorMsg 
}


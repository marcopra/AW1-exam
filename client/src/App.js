import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container, Row, Col, Alert} from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navigation } from './Navigation';
import { DefaultLayout, MainLayout, NotFoundLayout } from './PageLayout';
import { useEffect, useState } from 'react';
import { LoginForm } from './LoginComponents';
import API from './API';


function App() {
  return (
    <Router>
      <App2 />
    </Router>
  )
}


function App2() {

  //In questo stato viene salvato il carico didattico che viene mostrato.
  //ATTENZIONE: questo carico didattico contiene anche le aggiunte/cancellazioni temporanee dell'utente, perciò non corrisponderà sempre con le informazioni salvate nel db
  const [caricoDidatticoTemp, setCaricoDidatticoTemp] = useState([]);


  
  const [fullTime, setFullTime] = useState(); 
  const [newUser, setNewUser] = useState();
  const [loggedIn, setLoggedIn] = useState(false); 
  const [user, setUser] = useState({});
  const [errorMsg, setErrorMsg] = useState('');  // stringa vuota '' = non c'e' errore
  const [message, setMessage] = useState(''); // stringa vuota '' = non c'e' errore
  const [exams, setExams] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [cfu, setCfu] = useState(0);



  let tempCfu = 0;
  

  const navigate = useNavigate();

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        //vengono prese le informazioni dell'utente, se quest'ultimo ha fatto il log-in
        const user = await API.getUserInfo();

        setLoggedIn(true);
        setDirty(true);
        setUser(user);

      } catch(err) {
        
      }
    };
    checkAuth();
  }, []);


  //Questa useEffect e quella successiva sono molto simili, ma per una chiarezza del codice sono 
  //ne sono state dichiarate due diverse, questa che verrà invocata solo quando vi è un log-in/log-out
  // dell'utente, la successiva quando verrà messo dirty = true
  useEffect(() => {
    
    
    API.getAllCourses()
      .then( (courses) => {setExams(courses); setDirty(false); } )
      .catch( err => setErrorMsg("Impossibile caricare i corsi disponibili"));

    if (loggedIn)
    {
      API.getCaricoDidatticoToDisplay()
      .then( (carico) => {
        setDirty(false); 
        setCaricoDidatticoTemp(carico);
        setFullTime(user.fullTime != 0 ? 1 : 0);
        setNewUser(user.fullTime == -1);

        tempCfu = 0;
        for (const cd of carico){
      
          tempCfu += cd.cfu;    
        }
        setCfu(tempCfu);
      
      } )
      .catch( err => setErrorMsg("Impossibile caricare il piano carriera"));

    
    }
  
  }, [loggedIn])


  useEffect(() => {
    
    if(dirty)
    {
    
      API.getUserInfo().then((us) => 
        {
          setUser(us);
          //Se fullTime è -1 nel server, ovvero il valore di default, viene messo come stato di default fullTime = 1
          setFullTime(us.fullTime != 0 ? 1 : 0); 
          //un New User ha la possibilità di cambiare lo stato full time/ part time
          setNewUser(us.fullTime == -1);
      
        });
        
        API.getAllCourses()
        .then( (courses) => {
          setExams(courses); 
          setDirty(false); 
        })
        .catch( err => setErrorMsg("Impossibile caricare i corsi disponibili"));
        
      
        API.getCaricoDidatticoToDisplay()
        .then( (carico) => {
          setDirty(false); 
          setCaricoDidatticoTemp(carico);
          
          tempCfu = 0;
          for (const cd of carico){
            
            tempCfu += cd.cfu;    
          }
          
          setCfu(tempCfu);
        })
        .catch( err => setErrorMsg("Impossibile caricare il piano carriera"));

    }
      
  }, [dirty])

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then( user => {
        setLoggedIn(true);
        setUser(user);
        setMessage('');
        navigate('/');
      })
      .catch(err => {
        setMessage(err);
      })
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    setMessage('');
    setErrorMsg('');
    navigate('/');
  }

  
  //Funzione che viene chiamata per salvare le modifiche del piano carriera
  async function salvataggioCaricoDidattico(caricoDidatticoTemp) {
    setMessage('');
    await API.addExamToCarico(fullTime, caricoDidatticoTemp)
         .then(() => {setDirty(true); setMessage('');})
         .catch( err => {setErrorMsg("Impossibile aggiungere gli esami al piano carriera");});
  }
  
  //Funzione che viene chiamata per cancellare le modifiche del piano carriera
  const cancelCaricoDidattico = () => {
    //Forzo il reload dei dati dal server
    setDirty(true);
  };

  //Questa funzione serve per svuotare caricoDidattico.
  //ATTENZIONE: in questa funzione non ci sta nessun salvataggio, l'utente dovrà poi salvare le modifiche
  const svuotaPiano = () => {
    setCaricoDidatticoTemp([]);
    setCfu(0);
  }

  //Questa fnzione serve per cancellare in maniera permanente il piano di studi dell'utente
  async function cancellaTutto() {

    API.deleteAllCarico().then(() => {
      setNewUser(true);
      setDirty(true);
    })
    .catch( err => {setErrorMsg("Impossibile cancellare il piano carriera")});
    
  }
  

  return (
    <>
      
      <Container className="App">
        <Navigation loggedIn = {loggedIn} doLogOut = {doLogOut} user={user}/>
        <Row className = "below-nav"><Col>
        {message ? <Alert variant='danger' onClose={() => setMessage('')} dismissible>{message}</Alert> : false}
        </Col></Row>
        <Routes>
          {/*-----------Home Page NON logged-in -----------*/} 
          <Route path = '/main' element = {loggedIn ? <Navigate to='/homePage' /> : <DefaultLayout exam = {exams}/>}/>
          {/*-----------Log-in page -----------*/} 
          <Route path = '/login' element = {<LoginForm login={doLogIn}/>}/> 
          {/*-----------Main Page, redirect the user to the proper page -----------*/} 
          <Route path='/'   element={loggedIn ? <Navigate to='/homePage' /> : <Navigate to='/main' />  } /> 
          {/*-----------Home Page logged-in -----------*/} 
          <Route path = '/homePage' element = {loggedIn ? <MainLayout exam = {exams} setExams = {setExams} caricoDidattico = {caricoDidatticoTemp} setCaricoDidattico = {setCaricoDidatticoTemp} 
          save = {(ex) => salvataggioCaricoDidattico(ex)} cancel = {(ex) => cancelCaricoDidattico(ex)} cfu = {cfu} setCfu = {setCfu} svuotaPiano = {svuotaPiano} cancellaTutto = {cancellaTutto} 
          setDirty = {setDirty} setFullTime = {setFullTime} fullTime= {fullTime} newUser = {newUser} user = {user} setErrorMsg={setErrorMsg} errorMsg = {errorMsg} /> : <Navigate to='/main'/>}/>
          {/*-----------ERROR 404 -----------*/} 
          <Route path='/*' element={<NotFoundLayout />}/> 
        </Routes>
     </Container>
  
    
    </>

  );
  
}

export default App;

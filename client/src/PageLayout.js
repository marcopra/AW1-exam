import { FullTable } from "./FullTable";
import { CaricoDidatticoLayout, FullTableCarico } from "./CaricoDidattico";
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, Link, useParams, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState } from "react";
import { Fade } from "react-bootstrap";


//Home page non logged-in
function DefaultLayout(props) {

  return (
    <Row >
      <Col className="below-nav">
        <h1  className="text-secondary text-center">OFFERTA FORMATIVA</h1>
        <FullTable exam={props.exam} />
      </Col>
    </Row>
  );
}


//home page logged-in
function MainLayout(props) {
  
  
  let fullTime = props.fullTime;
  let setFullTime = props.setFullTime;
  
  

  const [open, setOpen] = useState(true);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(true)
  




  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleOpen = () => setOpen(!open);
  


  function addExam(ex) {
    let dirty = true;
    props.setCaricoDidattico((exams) => [...exams, ex])

    props.setExams((exams) => 
    {
        if(dirty){
            let Index = exams.findIndex((exam) => ex.codice == exam.codice);
            exams[Index].studenti_iscritti = exams[Index].studenti_iscritti + 1;
            dirty = false;
        }
        return exams;
    });
  }  


  //Impostazione minimo e massimo degli esami
  let minCfu;
  let maxCfu;
  if (props.fullTime) {
      minCfu = 60;
      maxCfu = 80;
  }
  else {
      minCfu = 20; 
      maxCfu = 40;
  }
  
  return (
    <>
      <Row className="vh-100">
        <Col className="below-nav">
          <h1>Benevenuto {props.user.name}!</h1>
          <FullTableCarico cfu = {props.cfu} exam={props.exam} setExams = {props.setExams} caricoDidattico={props.caricoDidattico} setCaricoDidattico={props.setCaricoDidattico} addExam = {addExam} 
          setErrorMsg = {props.setErrorMsg} setOpen = {setOpen} fullTime = {fullTime} setSaved = {setSaved} setCfu = {props.setCfu}/>
          {open ?
          <>
            <Button aria-controls="example-fade-text"
              aria-expanded={open}
              className="mt-5"
              variant="outline-danger" onClick= { saved ? handleOpen : handleShow  }>
              Chiudi Carico Didattico
            </Button>
            <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>ATTENZIONE</Modal.Title>
            </Modal.Header>
            <Modal.Body>Le modifiche non sono state salvate!</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={ () => { 
                setShow(false); 
                props.cancel(); 
                setSaved(true); 
                setOpen(false); 
                props.setErrorMsg("");
                }}>
                Cancella Modifiche
              </Button>
              <Button variant="primary" onClick={() => { 
                
                setShow(false); 
        
                if(props.cfu >= minCfu && !props.errorMsg)
                {
                    props.save(props.caricoDidattico); 
                    setSaved(true); 
                    setOpen(false);
                    props.setErrorMsg("");
                    
              
                }
                else if(props.cfu < minCfu){
                    props.setErrorMsg("Per salvare il piano di studi selezionare un numero di esami che abbia un numero di CFU compreso tra " + minCfu + " e " + maxCfu );
                    setSaved(false); 

                }

              }}>
                Salva Modifiche
              </Button>
            </Modal.Footer>
          </Modal>
          </>
            :
              <Button
                onClick={() => {setOpen(!open); props.setErrorMsg(""); props.setDirty(true); }}
                aria-controls="example-fade-text"
                aria-expanded={open}
                className="mt-5"
                variant="outline-success"
              >
                Apri Carico Didattico
              </Button>
        
          }
          <Fade in={open}>
            <div id="example-fade-text">
              <CaricoDidatticoLayout exam={props.exam} setExams = {props.setExams} caricoDidattico={props.caricoDidattico} setCaricoDidattico={props.setCaricoDidattico} 
              setErrorMsg = {props.setErrorMsg} errorMsg = {props.errorMsg} fullTime = {props.fullTime} setFullTime = {setFullTime} cfu = {props.cfu} setCfu = {props.setCfu}
              save = {props.save} setSaved = {setSaved} setOpen = {setOpen} cancel = {props.cancel} svuotaPiano = {props.svuotaPiano} cancellaTutto = {props.cancellaTutto} newUser = {props.newUser}/>
            </div>
          </Fade>
        </Col>
      </Row>
    </>
  );

}

//Pagina non trovata
function NotFoundLayout() {
  return <>
    <div className="row justify-content-center">
      <div className="col-md-12 col-sm-12 main-card" >
        <div className="card shadow-lg border-0 rounded-lg mt-5 mx-auto">
          <h3 className="card-header display-1 text-muted text-center">
            404
          </h3>
          <span className="card-subtitle mb-2 text-muted text-center" >
            Pagina non trovata, premi il bottone per tornare alla Home!
          </span>
          <Link to="/">
            <div className="card-body mx-auto">
              <Button className="btn btn-sm btn-info text-white button-error">Go Home</Button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  </>
}

export { DefaultLayout, MainLayout, NotFoundLayout }; 
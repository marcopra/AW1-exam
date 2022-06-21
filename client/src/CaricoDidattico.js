
import { Container, Row, Col, Button, Form, FormCheck, Dropdown, Alert, Table, Pagination } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';

function CaricoDidatticoLayout(props) {

    let fullTime = props.fullTime;    
    let setFullTime = props.setFullTime;
    

    /*CFU organization Part*/
    let minCfu;
    let maxCfu;
    if (fullTime) {
        minCfu = 60;
        maxCfu = 80;
    }
    else {
        minCfu = 20; 
        maxCfu = 40;
    }

    return (
        <>
            <Row>
                <Col>
                    <Form>
                        <div key={`inline-radio`} className="mb-3">
                            <Form.Check

                                inline
                                label="Full-Time"
                                name="group1"
                                type="radio"
                                id={`inline-radio-1`}
                                checked={props.fullTime != 0}
                                disabled = {!props.newUser}
                                onClick = {() => (setFullTime(1))}
                            />
                            <Form.Check
                                inline
                                label="Part-Time"
                                name="group1"
                                type="radio"
                                id={`inline-radio-2`}
                                disabled = {!props.newUser}
                
                                checked={props.fullTime == 0}
                                onClick = {() => (setFullTime(0))}
                            />
                        </div>
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col>
                    {props.errorMsg ? <Alert variant='danger' onClose={() => props.setErrorMsg('')} dismissible>{props.errorMsg}</Alert> : false}
                </Col>
            </Row>
            <Row>
                { props.caricoDidattico.length > 0 ? <CaricoDidattico all_exam = {props.exam} setExams = {props.setExams} exam = {props.caricoDidattico} setCaricoDidattico = {props.setCaricoDidattico} setCfu = {props.setCfu} setErrorMsg = {props.setErrorMsg} setSaved = {props.setSaved}/> : <h4 className="text-center"> Il Piano di Studi è vuoto!  <br/> Per aggiungere degli esami al piano carriera premere il pulsante + accanto agli esami. </h4>}
            </Row>
            <Row className = 'pt-5'>
                
                <Col>
                    <Form.Group className="mb-3 w-50">
                        <Form.Label> {"Scegliere un numero di CFU compreso tra " + minCfu.toString() + " e " + maxCfu.toString()}</Form.Label>
                        <Form.Control placeholder={"CFU scelti: " + props.cfu.toString()} disabled />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col className = "text-center">
                <Button className = "btn-lg m-2" variant = "success" onClick = {() => {
                    
                    if(props.cfu >= minCfu && !props.errorMsg)
                    {
                        props.save(props.caricoDidattico); 
                        
                        props.setSaved(true); 
                        props.setOpen(false);
                        props.setErrorMsg("");
                    }
                    else if(props.cfu < minCfu){
                        props.setErrorMsg("Per salvare il piano di studi selezionare un numero di esami che abbia un numero di CFU compreso tra " + minCfu + " e " + maxCfu );
                        props.setSaved(false); 
      
                    }
                    
                    
                    }}> Salva Modifiche </Button>
                <Button className = "btn-lg m-2" variant = "warning"  onClick = {() => {props.cancel(); props.setSaved(true); props.setOpen(false); props.setErrorMsg("");}}> Cancella Modifiche</Button>
                <Button className = "btn-lg m-2" variant = "secondary"  onClick = {() => {props.svuotaPiano(); props.setErrorMsg("");}}> Svuota il Piano di Studi </Button>
                </Col>
            </Row>
            <Row>
            <Col className = "text-center">
                <Button className = "btn-lg m-2" variant = "danger"  onClick = {() => {props.cancellaTutto(); props.setErrorMsg(""); props.setSaved(true); props.setErrorMsg("");}}> Cancella il Piano di Studi </Button>
            </Col>
            </Row>
        </>);


}

/************************************* PIANO DI STUDI  *******************************/
function CaricoDidattico(props) {
    
    

    //Funzione per cancellare un esame
    const cancelAnExam = (exam) => {
        let dirty = true;
        //Se è l'esame propedetico di un altro esame non si può cancellare!
        if(props.exam.find((ex) => ex.propedeutico == exam.codice)){
            let temp = props.exam.filter((ex) => ex.propedeutico == exam.codice);
            props.setErrorMsg("L'esame selezionato non si può cancellare poichè è propedeutico all'esame: " + temp[0].codice + "-" + temp[0].nome);  
        }
        else{

            props.setCaricoDidattico((exams) => exams.filter((ex) => ex.codice != exam.codice));
            

            props.setExams((exams) => 
            {
                if(dirty){
                    let Index = exams.findIndex((ex) => ex.codice == exam.codice);
                    exams[Index].studenti_iscritti = exams[Index].studenti_iscritti - 1;
                    dirty = false;
                }
                return exams;
            });


            props.setCfu((cfu) => cfu - exam.cfu);
            props.setErrorMsg("")
            props.setSaved(false);
        }
    }
    

    return (
        <>
            <Table bordered responsive >
                <thead>
                    <tr>
                        <th>Codice</th>
                        <th>Esame</th>
                        <th>CFU</th>
                        <th>Studenti Iscritti</th>
                        <th>Numero Iscrizioni Ammesse</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {props.exam.map((ex) => <ExamRowCarico exam={ex} key={ex.codice} id={ex.codice} cancel = {cancelAnExam} />)}
                </tbody>
            </Table>
        </>

    );

}

function ExamRowCarico(props) {

    return (
        <>
            <tr ><ExamDataCarico exam={props.exam} cancel = {props.cancel} /></tr>
        </>
    );
}

function ExamDataCarico(props) {
    return (
        <>
            <td>{props.exam.codice}</td>
            <td>{props.exam.nome}</td>
            <td>{props.exam.cfu}</td>
            <td>{props.exam.studenti_iscritti}</td>
            <td>{props.exam.max_studenti != -1 ? props.exam.max_studenti : ""}</td>
            <td> <Button variant='outline-danger' className = "btn-sm" onClick={ () => props.cancel(props.exam) }><i className="bi bi-trash3"></i></Button></td>
        </>
    );
}


/************************************* TABELLA COMPLETA   *******************************/

function FullTableCarico(props) {

    //function order exam ***By Name***
    let exam = props.exam.sort((a, b) => a.nome < b.nome ? -1 : 1);

    /*CFU organization Part*/
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
           
            <Table bordered responsive >
                <thead>
                    <tr>
                        <th></th>
                        <th>Codice</th>
                        <th>Esame</th>
                        <th>CFU</th>
                        <th>Studenti Iscritti</th>
                        <th>Numero Iscrizioni Ammesse</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {exam.map((ex) => <ExamRow exam={ex} setExams = {props.setExams} all_exams={exam} caricoDidattico = {props.caricoDidattico} setCaricoDidattico = {props.setCaricoDidattico}  
                    key={ex.codice} id={ex.codice} addExam = {props.addExam} setErrorMsg = {props.setErrorMsg} setOpen = {props.setOpen} fullTime = {props.fullTime} 
                    setFullTime = {props.setFullTime} setSaved = {props.setSaved} setCfu = {props.setCfu} maxCfu = {maxCfu} cfu = {props.cfu}
                    />)}
                </tbody>
            </Table>
          
        </>

    );
}

function ExamRow(props) {

    const [details, setDetails] = useState(false);
    

    let errorMsg = "";
    
    
    let exam  = props.exam;
    let lock = false;
    let alreadyChosen = false;
    let esamiIncompatibili;
    let esamiIncompatibiliStringa;

    /*Gestione dei dettagli */
    /*ATTENZIONE: un esame può avere al massimo 1 esame propedeutico*/
    let esamePropedeutico = props.exam.propedeutico;
    let nomeEsamePropedeutico = props.all_exams.filter((ex) => ex.codice == esamePropedeutico);

    
    /*Esami incompatibili*/
    esamiIncompatibili = props.all_exams.filter((c) => 
    {
    
    //Controllo che un film gia presente nel carico non sia incompatibile con la scelta fatta
    let incompatibileCarico = c.incompatibile.split(" ");
    for (var i = 0; i < incompatibileCarico.length; i ++ )
    {
        
        if (incompatibileCarico[i] === exam.codice)
        {
            
            return true;
        }

    }


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

    });

    
    esamiIncompatibiliStringa = "";
    for (var i = 0; i < esamiIncompatibili.length; i ++ ){
        esamiIncompatibiliStringa += esamiIncompatibili[i].codice + "-" + esamiIncompatibili[i].nome + " ";
        
    }
          
    
    /*CONTROLLI*/
    /*Controllo incompatibilità*/
  
       
    if(props.caricoDidattico.find(c => {
                                    
        //Controllo che un film gia presente nel carico non sia incompatibile con la scelta fatta
        let incompatibileCarico = c.incompatibile.split(" ");
        for (var i = 0; i < incompatibileCarico.length; i ++ )
        {
            
            if (incompatibileCarico[i] === exam.codice)
            {
                
                return true;
            }
    
        }

    
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
        
    }))
    {
        lock = true;

        
        
        errorMsg +="Incompatibilità con l'esame '" + esamiIncompatibiliStringa + "'. ";
    }
    /*Controllo propedeucità*/
    if((exam.propedeutico != '')  && (!props.caricoDidattico.find((c) => c.codice === exam.propedeutico)))//Si cotrolla se effettivamente c'è un esame propedeutico
    {
        
        lock = true;
        let propedeutico = props.all_exams.filter((c) => c.codice === exam.propedeutico)
        errorMsg += "Scegliere prima l'esame propedeutico '" + propedeutico[0].codice + "-" + propedeutico[0].nome + "'. " ;
        

    }

    /*Si controlla se sono ammesse ulteriori iscrizioni al corso */
    //il > non è nescessario poichè non si dovrebbero superare il numero massimo di studenti.
    //Tuttavia, viene comunque messo il > poichè qualora ci fosse un errore sul server non vengono comunque ammesse nuove iscrizioni  
    if((exam.max_studenti != -1) && (exam.studenti_iscritti >= exam.max_studenti )) 
    {
        lock = true;
        errorMsg = "Per questo corso è stato raggiunto il numero massimo di iscrizioni. ";
    }


    /* Controllo esame già scelti */
    if (props.caricoDidattico.find((c) => props.exam.codice === c.codice )){
        alreadyChosen = true;
    }
    else{
        alreadyChosen = false;
    }

    if((props.maxCfu - props.cfu < exam.cfu) && !alreadyChosen){
        lock = true;
        errorMsg = "Spiacente, non sono disponibili abbastanza crediti per scegliere anche questo corso. ";
    }
    
    
    return (
        <>
            <tr className= { alreadyChosen ?  "table-primary" : !lock ? "" : "table-danger"} ><ExamData exam={props.exam} setDetails={setDetails} details={details} toEdit = {props.toEdit} errorMsg = {errorMsg} 
            addExam = {props.addExam} lock = {lock} alreadyChosen={alreadyChosen} setErrorMsg = {props.setErrorMsg} setOpen = {props.setOpen} fullTime = {props.fullTime} setFullTime = {props.setFullTime}
            setSaved = {props.setSaved} setCfu = {props.setCfu}
            /></tr>

            {details ?
                <tr>
                    <td colSpan="8" className="table-active">
                        <Table>
                            <tbody>
                                <tr>
                                    <td width="70">Esami Propedeuci:</td>
                                    <td width="300">{props.exam.propedeutico ? props.exam.propedeutico + "-" + nomeEsamePropedeutico[0].nome : "Nessuno"}</td>
                                </tr>
                                <tr>
                                    <td width="70">Esami Incompatibili:</td>
                                    <td width="300">{esamiIncompatibiliStringa ? esamiIncompatibiliStringa : "Nessuno"}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </td>
                </tr>
                : ""
            }
        </>
    );
}

function ExamData(props) {
    return (
        <>
            <td >{props.details ? <Button className='button-up' onClick={() => props.setDetails((val) => !val)}><i className="bi bi-caret-up"></i></Button> : <Button className='button-down' onClick={() => props.setDetails((val) => !val)}><i className="bi bi-caret-down"></i></Button>}</td>
            <td>{props.exam.codice}</td>
            <td>{props.exam.nome}</td>
            <td>{props.exam.cfu}</td>
            <td>{props.exam.studenti_iscritti}</td>
            <td>{props.exam.max_studenti != -1 ? props.exam.max_studenti : ""}</td>
            <td width="30%">{props.errorMsg}</td>
            <td> <Button disabled = {props.lock || props.alreadyChosen ? true : false} className='button-plus' onClick={() => { props.setOpen(true); if(props.fullTime == undefined){ props.setErrorMsg("Scegliere prima l'opzione full-time o part-time")} else {props.addExam(props.exam); props.setErrorMsg(""); props.setSaved(false); props.setCfu((cfu) => cfu + props.exam.cfu)}}}>+</Button></td>
            
        </>

    );
}
export { CaricoDidatticoLayout, FullTableCarico };
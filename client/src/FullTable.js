import { Table, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Container, Row, Navbar, Nav, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';


function FullTable(props) {

    //function order exam ***By Name***
    let exam = props.exam.sort((a, b) => a.nome < b.nome ? -1 : 1);

    return (
        <>
           
            <Table bordered responsive className='table-fixed' >
                <thead>
                    <tr>
                        <th></th>
                        <th>Codice</th>
                        <th>Esame</th>
                        <th>CFU</th>
                        <th>Studenti Iscritti</th>
                        <th>Numero Iscrizioni Ammesse</th>
                    </tr>
                </thead>
                <tbody>
                    {exam.map((ex) => <ExamRow exam={ex} all_exams={exam}  key={ex.codice} id={ex.codice} />)}
                </tbody>
            </Table>
          
        </>

    );
}

function ExamRow(props) {

    /*Gestione Dettagli*/

    /*ATTENZIONE: un esame può avere al massimo 1 esame propedeutico*/
    let esamePropedeutico = props.exam.propedeutico;
    let nomeEsamePropedeutico = props.all_exams.filter((ex) => ex.codice == esamePropedeutico);

    let listaCodiciEsamiIncompatibili = props.exam.incompatibile.split(" ");
    
    /*Esami incompatibili*/
    let esamiIncompatibili = props.all_exams.filter((ex) => 
    {
        let flag = false;

        for (var i = 0; i < listaCodiciEsamiIncompatibili.length; i ++ )
        {
           
            if(ex.codice === listaCodiciEsamiIncompatibili[i]){
                flag = true;
                
            }
        }
        return flag;

    });
    

    let esamiIncompatibiliStringa = "";

    for (var i = 0; i < esamiIncompatibili.length; i ++ ){
        esamiIncompatibiliStringa += esamiIncompatibili[i].codice + "-" + esamiIncompatibili[i].nome + " ";
    }


    const [details, setDetails] = useState(false);
    return (
        <>
            <tr><ExamData exam={props.exam} setDetails={setDetails} details={details} /></tr>
            {details ?
                <tr>
                    <td colSpan="6" className="table-active">
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
        </>
    );
}

export { FullTable }
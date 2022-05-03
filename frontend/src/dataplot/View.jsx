import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Col'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import { useApp } from '../App'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import { LineChart, Line } from 'recharts';

function View() {
    const app = useApp()
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const data = [{ name: 'Page A', uv: 400, pv: 2400, amt: 2400 }];
    function updateData() {
        app.send({ name: "update", args: { fromDate, toDate } })
    }
    return <Container className="mt-2">
        <Row className="d-flex align-items-center">
            <Col md={1}><span className="float-end me-2">From</span></Col>
            <Col>
                <DatePicker className="form-control"
                    showTimeSelect
                    selected={fromDate}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    onChange={(date) => setFromDate(date)}
                />
            </Col>
            <Col md={1}><span className="float-end me-2">To</span></Col>
            <Col>
                <DatePicker className="form-control"
                    showTimeSelect
                    selected={toDate}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    onChange={(date) => setToDate(date)}
                />
            </Col>
            <Col md={1}></Col>
            <Col md={2}>
                <Button variant="primary" onClick={updateData}>
                    Update
                </Button>
            </Col>
        </Row>
        <LineChart width={400} height={400} data={data} fill="gray">
            <Line type="monotone" dataKey="uv" stroke="#8884d8" />
        </LineChart>
    </Container>
}

export default View

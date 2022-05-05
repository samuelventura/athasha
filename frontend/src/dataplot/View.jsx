import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Col'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Table from 'react-bootstrap/Table'
import { useApp } from '../App'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { Tooltip, Legend } from 'recharts';
function hourAgo(hours) {
    var dt = new Date();
    dt.setHours(dt.getHours() - hours);
    return dt
}
function View() {
    const app = useApp()
    const [tab, setTab] = useState('plot');
    const [fromDate, setFromDate] = useState(hourAgo(1));
    const [toDate, setToDate] = useState(new Date());
    const cols = app.state.config.columns
    const min = Number(app.state.config.setts.min)
    const max = Number(app.state.config.setts.max)
    const raw = app.state.data
    const data = raw.map((p) => {
        const dp = {}
        cols.forEach((c, i) => {
            dp[c.name] = p[i]
        })
        return dp
    })
    //https://clrs.cc/
    const colorOffset = 0
    //https://www.schemecolor.com/beautiful-rainbow.php
    const lineColors = ["#5E02E9", "#3C70EF", "#30D800", "#E7E200", "#FD8B00", "#F20800"]
    //https://www.schemecolor.com/retro-vibrant-rainbow.php
    //const lineColors = ["#267A9E", "#51A885", "#F5A936", "#ED8C37", "#DB7476", "#986B9B"]
    const plotLines = cols.filter((c, i) => i > 0).map((c, i) =>
        <Line key={i} type="monotone" strokeWidth={2}
            dataKey={cols[i + 1].name}
            stroke={lineColors[(i + colorOffset) % lineColors.length]} />)
    const tableCols = cols.map((c, i) => <th key={i}>{c.name}</th>)
    function tableRow(dp) { return cols.map((c, i) => <td key={i}>{dp[i]}</td>) }
    const tableRows = raw.map((dp, i) => <tr key={i}>{tableRow(dp)}</tr>)
    function updateData() {
        app.send({ name: "update", args: { fromDate, toDate } })
    }
    function formatTick(v) {
        v = new Date(v)
        return v.toLocaleTimeString()
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
        <Tabs
            activeKey={tab}
            onSelect={(t) => setTab(t)}
            className="mt-3"
        >
            <Tab eventKey="plot" title="Plot" className='plot'>
                <ResponsiveContainer height='100%' width='100%'
                    className="mt-2">
                    <LineChart width={800} height={400} data={data} fill="gray">
                        <Tooltip />
                        <Legend />
                        <XAxis dataKey={cols[0].name} interval="preserveStartEnd"
                            minTickGap={20}
                            tickFormatter={formatTick} />
                        <YAxis domain={[min, max]} />
                        {plotLines}
                    </LineChart>
                </ResponsiveContainer>
            </Tab>
            <Tab eventKey="table" title="Table">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            {tableCols}
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </Table>
            </Tab>
        </Tabs>
    </Container >
}

export default View

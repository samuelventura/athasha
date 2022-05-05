import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Col'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Table from 'react-bootstrap/Table'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
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
function getUniqueColor(n) {
    const rgb = [0, 0, 0];
    for (let i = 0; i < 24; i++) {
        rgb[i % 3] <<= 1;
        rgb[i % 3] |= n & 0x01;
        n >>= 1;
    }
    return '#' + rgb.reduce((a, c) => (c > 0x0f ? c.toString(16) : '0' + c.toString(16)) + a, '')
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
    const plotLines = cols.filter((c, i) => i > 0).map((c, i) =>
        <Line key={i} type="monotone" strokeWidth={2}
            dataKey={cols[i + 1].name}
            stroke={getUniqueColor(i)} />)
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
    function downloadData(sep, ext) {
        const heads = cols.map(c => c.name)
        const rows = raw.map(p => {
            return p.join(sep)
        })
        const csv = heads.join(sep) + "\n" + rows.join("\n")
        const element = document.createElement('a')
        const now = new Date()
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        const filename = now.toISOString().replaceAll("-", "").replaceAll(":", "").replaceAll(".", "")
        element.setAttribute('href', 'data:text/plaincharset=utf-8,' + encodeURIComponent(csv))
        element.setAttribute('download', `${filename}.athasha.dataplot.${ext}`)
        element.style.display = 'none'
        element.click()
    }
    function downloadCsv() { downloadData(",", "csv") }
    function downloadTsv() { downloadData("\t", "tsv") }
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
                <Dropdown as={ButtonGroup}>
                    <Button variant="primary" onClick={updateData}>
                        Update
                    </Button>
                    <Dropdown.Toggle split />
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={downloadCsv}>Download CSV</Dropdown.Item>
                        <Dropdown.Item onClick={downloadTsv}>Download TSV</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
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

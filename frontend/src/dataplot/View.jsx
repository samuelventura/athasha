import React, { useState, useMemo } from 'react'
import numeral from 'numeral'
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
import Files from "../tools/Files"

function hourAgo(hours) {
    var dt = new Date();
    dt.setHours(dt.getHours() - hours);
    return dt
}

function DataPlot({ config, data, defs }) {
    const cols = config.columns
    const ymin = Number(config.setts.ymin)
    const ymax = Number(config.setts.ymax)
    const lineWidth = Number(config.setts.lineWidth)
    const list = data.map((p) => {
        const dp = {}
        cols.forEach((c, i) => {
            dp[c.name] = p[i]
        })
        return dp
    })
    if (list.length == 0) {
        defs.forEach((dp) => list.push(dp))
    }
    const plotLines = cols.filter((c, i) => i > 0).map((c, i) =>
        <Line key={i} type="monotone" strokeWidth={lineWidth} dot={false}
            dataKey={cols[i + 1].name}
            stroke={cols[i + 1].color} />)
    function formatXTick(v) {
        v = new Date(v)
        return v.toTimeString().split(' ')[0]
    }
    function formatYTick(v) {
        //http://numeraljs.com/
        return numeral(v).format(config.setts.yformat)
    }
    return <ResponsiveContainer height='100%' width='100%'
        className="mt-2">
        <LineChart width={800} height={400} data={list} fill="gray">
            <Tooltip />
            <Legend />
            <XAxis dataKey={cols[0].name} interval="preserveStartEnd"
                minTickGap={20}
                tickFormatter={formatXTick} />
            <YAxis domain={[ymin, ymax]}
                tickFormatter={formatYTick} />
            {plotLines}
        </LineChart>
    </ResponsiveContainer>
}

function DataTable({ config, data }) {
    const cols = config.columns
    const tableCols = cols.map((c, i) => <th key={i}>{c.name}</th>)
    function tableRow(dp) { return cols.map((c, i) => <td key={i}>{dp[i]}</td>) }
    const tableRows = data.map((dp, i) => <tr key={i}><td>{i + 1}</td>{tableRow(dp)}</tr>)
    return <Table striped bordered hover>
        <thead>
            <tr>
                <th>#</th>
                {tableCols}
            </tr>
        </thead>
        <tbody>
            {tableRows}
        </tbody>
    </Table>
}

function View() {
    const app = useApp()
    const [tab, setTab] = useState('plot');
    //set TO 1 hour ahead to catch updates without changing range
    const [fromDate, setFromDate] = useState(hourAgo(2));
    const [toDate, setToDate] = useState(hourAgo(-1));
    const send = app.send
    const data = app.state.data
    const version = app.state.version
    const config = app.state.config
    const cols = config.columns
    const defs = []
    const dp1 = {}
    const dp2 = {}
    dp1[cols[0].name] = fromDate
    dp2[cols[0].name] = toDate
    defs.push(dp1)
    defs.push(dp2)
    const props = { config, data, send, defs }
    //tested to only trigger on update button click despite large list of deps
    const dataPlot = useMemo(() => <DataPlot {...props} />, [version, config, data, send])
    const dataTable = useMemo(() => <DataTable {...props} />, [version, config, data, send])
    //prevent svg width=0 error when table tab is selected
    const condPlot = tab == "plot" ? dataPlot : null
    function updateData() {
        send({ name: "update", args: { fromDate, toDate } })
    }
    function downloadData(sep, ext) {
        const heads = cols.map(c => c.name)
        const rows = data.map(p => {
            return p.join(sep)
        })
        const csv = heads.join(sep) + "\n" + rows.join("\n")
        Files.downloadText(csv, ext)
    }
    function downloadCsv() { downloadData(",", "athasha.dataplot.csv") }
    function downloadTsv() { downloadData("\t", "athasha.dataplot.tsv") }
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
                {condPlot}
            </Tab>
            <Tab eventKey="table" title="Table">
                {dataTable}
            </Tab>
        </Tabs>
    </Container >
}

export default View
